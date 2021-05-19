require_relative './constants.rb'

module Mattermost
  class UnicodeEmojiHelper
    include EmojiConstants

    def initialize
      path = File.join(File.dirname(__FILE__), './emoji-sequences.txt')
      @emoji_sequences = File.readlines(path)
    end

    def all_emoji_modifier_bases
      match_sequence = '; RGI_Emoji_Modifier_Sequence  ;'
      match_flag = '; RGI_Emoji_Flag_Sequence      ;'
      lines = @emoji_sequences.select { |l| l.include?(match_sequence) || l.include?(match_flag)}
      hex_strings = lines.map { |l| /^[0-9A-F]{4,5}/.match(l)[0] }
      integers = hex_strings.map { |s| s.to_i(16) }
      integers.map { |i| [i].pack('U') }
    end

    def emoji_modifier_base?(code_point)
      all_emoji_modifier_bases.include?(code_point)
    end

    def emoji_modifier_sequences(emoji_modifier_chars)
      return nil unless emoji_modifier_base?(emoji_modifier_chars[0])

      if emoji_modifier_chars.include?(GENDER_MALE)
        sequences = SKIN_TONE_MAP.each_key.map do |skin_tone_modifier|
          [emoji_modifier_chars[0],
           skin_tone_modifier,
           ZWJ,
           GENDER_MALE,
           VS16].join('')
        end
      else
        sequences = SKIN_TONE_MAP.each_key.map do |skin_tone_modifier|
          [emoji_modifier_chars[0], skin_tone_modifier].join('')
        end

        # Add female-specific sequences and see if they exist in the system font
        # by returning nil from the AppleEmojiExtractor
        sequences << SKIN_TONE_MAP.each_key.map do |skin_tone_modifier|
          [emoji_modifier_chars[0],
           skin_tone_modifier,
           ZWJ,
           GENDER_FEMALE,
           VS16].join('')
        end

        sequences.flatten!
      end

      sequences
    end
  end
end
