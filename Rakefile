task :console do
  require 'irb'
  require 'irb/completion'
  require './ruby/scrapper.rb'
  ARGV.clear
  IRB.start

end

task :scrape do
  require './ruby/scrapper.rb'
  Scrapper.run 'web/js/data.js'
end