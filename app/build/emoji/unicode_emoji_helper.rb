module Mattermost
  class UnicodeEmojiHelper
    GENDER_MALE = "\u{2642}"
    GENDER_FEMALE = "\u{2640}"
    ZERO_WIDTH_JOINER = "\u{200D}"
    VARIATION_SELECTOR_16 = "\u{FE0F}"
    
    SKIN_TONE_MAP = {
      "\u{1F3FB}" => 'light skin tone',
      "\u{1F3FC}" => 'medium-light skin tone',
      "\u{1F3FD}" => 'medium skin tone',
      "\u{1F3FE}" => 'medium-dark skin tone',
      "\u{1F3FF}" => 'dark skin tone'
    }.freeze

    def initialize
      path = File.join(File.dirname(__FILE__), './emoji-sequences.txt')
      @emoji_sequences = File.readlines(path)
    end

    def all_emoji_modifier_bases
      match_string = '; Emoji_Modifier_Sequence   ;'
      lines = @emoji_sequences.select { |l| l.include?(match_string) }
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
           ZERO_WIDTH_JOINER,
           GENDER_MALE,
           VARIATION_SELECTOR_16].join('')
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
           ZERO_WIDTH_JOINER,
           GENDER_FEMALE,
           VARIATION_SELECTOR_16].join('')
        end

        sequences.flatten!
      end

      sequences
    end
  end
end
