require 'set'
require_relative './constants.rb'

module Mattermost
  class UnicodeEmojiHelper

    MATCH_SEQUENCE = '; RGI_Emoji_Modifier_Sequence  ;'
    MATCH_FLAG = '; RGI_Emoji_Flag_Sequence      ;'
    MATCH_ZWJ = '; RGI_Emoji_ZWJ_Sequence  ;'

    def initialize
      path = File.join(File.dirname(__FILE__), '/emoji-sequences.txt')
      path2 = File.join(File.dirname(__FILE__), '/emoji-zwj-sequences.txt')

      lines = File.readlines(path).select { |l| l.include?(MATCH_SEQUENCE) || l.include?(MATCH_FLAG) }
      lines = lines + File.readlines(path2).select { |l| l.include?(MATCH_ZWJ) }
      # @emoji_sequences = @emoji_sequences + File.readlines(path)
      hex_strings = lines.map { |l| /^([\dA-F]{4,5}(\s[\dA-F]{4,5})+)/.match(l)[0] }
      @hex_sequences = hex_strings.reduce( Hash.new ) do |dict, hex|
        sequence = hex.split(' ').map { |s| [s.to_i(16)].pack("U")}
        key = sequence[0]
        value = dict.fetch(key, Set.new)
        value.add(sequence.join "")
        dict[key] = value

        dict
      end

      class << self
        attr_accessor :hex_sequences
      end
    end

    def emoji_modifier_sequences(emoji_modifier_chars)
      result = @hex_sequences[emoji_modifier_chars[0]]
      if (result == nil || result.size == 0)
        return nil
      end
      result.to_a
    end
  end
end
