require 'minitest/autorun'
require './unicode_emoji_helper.rb'

module Mattermost
  class UnicodeEmojiHelperTest < Minitest::Test
    def setup
      @unicode_emoji_helper = UnicodeEmojiHelper.new
    end

    def test_all_emoji_modifier_bases_count
      bases = @unicode_emoji_helper.all_emoji_modifier_bases
      assert_equal bases.count, 510
    end

    def test_emoji_modifier_base?
      valid_emoji_modifier_base = "\u{1F442}"
      invalid_emoji_modifier_base = "\u{1F1E6}"
      assert_equal @unicode_emoji_helper.emoji_modifier_base?(valid_emoji_modifier_base), true
      assert_equal @unicode_emoji_helper.emoji_modifier_base?(invalid_emoji_modifier_base), false
    end

    def test_emoji_modifier_sequences_valid_base_count
      sequences = @unicode_emoji_helper.emoji_modifier_sequences("\u{1F483}")
      assert_equal sequences.count, 5
    end

    def test_emoji_modifier_sequences_valid_base_combines_skin_tone_and_base
      base = "\u{1F483}"
      sequence = @unicode_emoji_helper.emoji_modifier_sequences(base)[0]
      sequence_parts = sequence.split('')
      assert_equal sequence_parts.count, 2
      assert_equal sequence_parts[0], base
      expected_modifier = UnicodeEmojiHelper::SKIN_TONE_MAP.keys.first
      assert_equal sequence_parts[1], expected_modifier
    end
  end
end
