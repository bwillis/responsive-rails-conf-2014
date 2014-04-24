# Inspired and modified from https://github.com/RapGenius/abstractogram

require 'nokogiri'
require 'restclient'
require 'active_support/core_ext/object/blank'
require 'json'

class Scrapper

  def self.run(location)
    talk_data = create_railsconf_2014_talks
    write_json_data location, talk_data
  end

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

    flat_schedules = get_flattened_schedules schedule_page, schedules

    # return flat_schedules, time_slots
    flat_schedules
  end

  def self.get_flattened_schedules(page, schedules)
    tab_links = page.search('nav#schedule_nav > ul#tabs a[href*="tabs"]')
    mapper = {}
    flat_schedules = []
    tab_links.each { |tab_link|
      mapper.merge!({ "#{tab_link['href'].gsub(/#/,'')}" => tab_link.text})
    }
    schedules.each { |key, value|
      value.each do |schedule|
        schedule[:day] = mapper[key]
        flat_schedules << schedule
      end
    }
    flat_schedules
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
          anchor_number = schedule[:link_to_talk].match(/\/\w+#(\w+)/)[1]
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
    end
  end

  def self.create_schedule_hash!(schedule_page, schedules, time_slots)
    schedule_page.search('div#tabs_container div[id*="tabs-"]').each do |tab|
      schedules[tab['id']]  = []
      time_slots[tab['id']] = []
      header = []
      tab.search('table.schedule tr').each_with_index do |row, row_index|
        time_string = row.at('td:eq(1)').text.strip
        time_slots[tab['id']] << time_string
        row.search('td:not(:eq(1))').each_with_index do |column, column_index|
          if column['class'] == 'header'
            header << column
            next
          end

          if (row_span = column['rowspan'])
            time_slot_indexes = []
            time_slot_indexes << (0..(row_span.to_i - 1)).map do |num|
              num + row_index
            end
          else
            time_slot_indexes = [row_index]
          end

          session_type = column['class']

          if (link_to_talk_container = (column.at('a[href*="/program"]') || column.at('a[href*="/workshops"]')))
            title = link_to_talk_container.text.strip
            link_to_talk = link_to_talk_container['href']
            speakers = column.at('h6').text.strip
            location_container =  header[column_index]
            location = location_container.text.strip if location_container
          elsif session_type == 'general_event'
            speakers_container = column.at('h6')
            title = column.at('h5').text.strip
            location_container =  column.at('h4')
            location = location_container.text.strip if location_container
            speakers = speakers_container.text.strip if speakers_container
          end
          if time_string.present?
            beginning_time = time_string.gsub(/\s*\-[^\-]+/,'')
            end_time = time_string.gsub(/[^\-]+\-\s*/,'')
          end

          schedules[tab['id']] << {
            # column:            column,
            location:          location,
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

  def self.write_json_data(location, hash)
    json = JSON.generate hash
    File.open(location, 'w') do |file|
      file.write "function getData(){ return #{json} }"
    end
  end
end
