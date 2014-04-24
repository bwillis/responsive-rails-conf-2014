# Inspired and modified from https://github.com/RapGenius/abstractogram

require 'nokogiri'
require 'restclient'
require 'active_support/core_ext/object/blank'

class Scrapper
  def self.fetch_and_parse(url)
    Nokogiri::HTML(RestClient.get(url))
  end

  def self.create_railsconf_2014_talks
    talks = []
    doc   = fetch_and_parse("http://railsconf.com/program")

    doc.css(".presentation .session").each do |elm|
      title    = elm.css("header h1").inner_text
      speaker  = elm.css("header h2").inner_text.presence
      abstract = elm.css("> p").inner_text
      bio      = elm.css(".bio").inner_text.presence

      talks << {
        :title    => title,
        :speaker  => speaker,
        :abstract => abstract,
        :bio      => bio
      }
    end
    talks
  end
end