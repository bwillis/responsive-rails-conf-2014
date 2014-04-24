# Inspired and modified from https://github.com/RapGenius/abstractogram

require 'nokogiri'
require 'restclient'
require 'active_support/core_ext/object/blank'

class Scrapper
  def self.fetch_and_parse(url)
    Nokogiri::HTML(RestClient.get(url))
  end

  def self.create_railsconf_2014_talks

    time_slots = {}
    schedules = {}

    schedule_page   = fetch_and_parse('http://railsconf.com/schedule')
    workshop_page   = fetch_and_parse('http://railsconf.com/workshops')
    session_page    = fetch_and_parse('http://railsconf.com/program')

    create_schedule_hash! schedule_page, schedules, time_slots

    assign_abstracts! workshop_page, schedules
    assign_abstracts! session_page, schedules

    return schedules, time_slots
  end

  def self.assign_abstracts! page, schedules
    page.css('.presentation .session').each do |elm|
      link_anchor            = elm.at('a[name]')['name']
      # title                  = elm.css("header h1").inner_text
      # speaker                = elm.css("header h2").inner_text.presence
      abstract               = elm.css('> p').inner_text
      bio                    = elm.css('.bio').inner_text.presence
      corresponding_schedule = nil
      schedules.each do |_,tab|
        corresponding_schedule = tab.find do |schedule|
          next unless schedule[:link_to_talk]
          anchor_number = schedule[:link_to_talk].match(/\/program#(\w+)/)[1]
          puts "#{anchor_number} + #{link_anchor}"
          anchor_number == link_anchor
        end
        break if corresponding_schedule
      end
      if corresponding_schedule
        corresponding_schedule.merge!({
                                         # :title    => title,
                                         # :speaker  => speaker,
                                         :abstract => abstract,
                                         :bio      => bio
                                     })
      end
      puts corresponding_schedule
    end
  end

  def self.create_schedule_hash!(schedule_page, schedules, time_slots)
    schedule_page.search('div#tabs_container div[id*="tabs-"]').each do |tab|
      schedules[tab['id']]  = []
      time_slots[tab['id']] = []
      tab.search('table.schedule tr').each_with_index do |row, row_index|
        time_string = row.at('td:eq(1)').text.strip
        time_slots[tab['id']] << time_string
        row.search('td:not(:eq(1))').each do |column|

          if (row_span = column['rowspan'])
            time_slot_indexes = []
            time_slot_indexes << (0..(row_span.to_i - 1)).map do |num|
              num + row_index
            end
          else
            time_slot_indexes = [row_index]
          end

          session_type = column['class']

          if (link_to_talk_container = column.at('a[href*="/program"]'))
            title = link_to_talk_container.text.strip
            link_to_talk = link_to_talk_container['href']
            speakers = column.at('h6').text.strip
          elsif session_type == 'general_event'
            title = column.at('h5').text.strip
          end
          if time_string.present?
            beginning_time = time_string.gsub(/\s*\-[^\-]+/,'')
            end_time = time_string.gsub(/[^\-]+\-\s*/,'')
          end

          schedules[tab['id']] << {
            # column:            column,
            begining_time:     beginning_time,
            end_time:          end_time,
            link_to_talk:      link_to_talk,
            title:             title,
            speaker:           speakers,
            time_string:       time_string,
            time_slot_indexes: time_slot_indexes,
            session_type:      session_type
          }
        end
      end
    end
  end
end
