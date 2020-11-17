require 'minitest/autorun'
require_relative './apple_emoji_extractor.rb'
require 'fastimage'

module Mattermost
  class AppleEmojiExtractorTest < Minitest::Test
    def setup
      @extractor = AppleEmojiExtractor.new(64)
      @file_cleanup_paths = []
    end

    def teardown
      @file_cleanup_paths.each do |path|
        File.delete(path) if File.file?(path)
      end
    end

    def test_find_emoji_png_exists
      control_path = 'images/test/1f448-1f3fe_control.png'
      new_path = 'images/test/1f448-1f3fe_new.png'

      png_bytes = @extractor.png("\u{1F448 1F3FE}")
      File.open(new_path, 'wb') { |f| f.write png_bytes }
      @file_cleanup_paths << new_path

      control_digest = Digest::MD5.hexdigest(File.read(control_path))
      new_png_digest = Digest::MD5.hexdigest(File.read(new_path))

      assert_equal control_digest, new_png_digest
    end

    def test_finds_emoji_png_for_genderless_person
      control_path = 'images/test/1f471-1f3fb_control.png'
      new_path = 'images/test/1f471-1f3fb.png'

      png_bytes = @extractor.png("\u{1F471 1F3FB}")
      File.open(new_path, 'wb') { |f| f.write png_bytes }
      @file_cleanup_paths << new_path

      control_digest = Digest::MD5.hexdigest(File.read(control_path))
      new_png_digest = Digest::MD5.hexdigest(File.read(new_path))

      assert_equal control_digest, new_png_digest
    end

    def test_png_present_for_all_expected_sequences
      sequences = ["\u{261D 1F3FB}", "\u{261D 1F3FC}", "\u{261D 1F3FD}", "\u{261D 1F3FE}", "\u{261D 1F3FF}", "\u{26F9 1F3FB}", "\u{26F9 1F3FC}", "\u{26F9 1F3FD}", "\u{26F9 1F3FE}", "\u{26F9 1F3FF}", "\u{270A 1F3FB}", "\u{270A 1F3FC}", "\u{270A 1F3FD}", "\u{270A 1F3FE}", "\u{270A 1F3FF}", "\u{270B 1F3FB}", "\u{270B 1F3FC}", "\u{270B 1F3FD}", "\u{270B 1F3FE}", "\u{270B 1F3FF}", "\u{270C 1F3FB}", "\u{270C 1F3FC}", "\u{270C 1F3FD}", "\u{270C 1F3FE}", "\u{270C 1F3FF}", "\u{270D 1F3FB}", "\u{270D 1F3FC}", "\u{270D 1F3FD}", "\u{270D 1F3FE}", "\u{270D 1F3FF}", "\u{1F385 1F3FB}", "\u{1F385 1F3FC}", "\u{1F385 1F3FD}", "\u{1F385 1F3FE}", "\u{1F385 1F3FF}", "\u{1F3C3 1F3FB}", "\u{1F3C3 1F3FC}", "\u{1F3C3 1F3FD}", "\u{1F3C3 1F3FE}", "\u{1F3C3 1F3FF}", "\u{1F3C4 1F3FB}", "\u{1F3C4 1F3FC}", "\u{1F3C4 1F3FD}", "\u{1F3C4 1F3FE}", "\u{1F3C4 1F3FF}", "\u{1F3C7 1F3FB}", "\u{1F3C7 1F3FC}", "\u{1F3C7 1F3FD}", "\u{1F3C7 1F3FE}", "\u{1F3C7 1F3FF}", "\u{1F3CA 1F3FB}", "\u{1F3CA 1F3FC}", "\u{1F3CA 1F3FD}", "\u{1F3CA 1F3FE}", "\u{1F3CA 1F3FF}", "\u{1F3CB 1F3FB}", "\u{1F3CB 1F3FC}", "\u{1F3CB 1F3FD}", "\u{1F3CB 1F3FE}", "\u{1F3CB 1F3FF}", "\u{1F3CC 1F3FB}", "\u{1F3CC 1F3FC}", "\u{1F3CC 1F3FD}", "\u{1F3CC 1F3FE}", "\u{1F3CC 1F3FF}", "\u{1F442 1F3FB}", "\u{1F442 1F3FC}", "\u{1F442 1F3FD}", "\u{1F442 1F3FE}", "\u{1F442 1F3FF}", "\u{1F443 1F3FB}", "\u{1F443 1F3FC}", "\u{1F443 1F3FD}", "\u{1F443 1F3FE}", "\u{1F443 1F3FF}", "\u{1F446 1F3FB}", "\u{1F446 1F3FC}", "\u{1F446 1F3FD}", "\u{1F446 1F3FE}", "\u{1F446 1F3FF}", "\u{1F447 1F3FB}", "\u{1F447 1F3FC}", "\u{1F447 1F3FD}", "\u{1F447 1F3FE}", "\u{1F447 1F3FF}", "\u{1F448 1F3FB}", "\u{1F448 1F3FC}", "\u{1F448 1F3FD}", "\u{1F448 1F3FE}", "\u{1F448 1F3FF}", "\u{1F449 1F3FB}", "\u{1F449 1F3FC}", "\u{1F449 1F3FD}", "\u{1F449 1F3FE}", "\u{1F449 1F3FF}", "\u{1F44A 1F3FB}", "\u{1F44A 1F3FC}", "\u{1F44A 1F3FD}", "\u{1F44A 1F3FE}", "\u{1F44A 1F3FF}", "\u{1F44B 1F3FB}", "\u{1F44B 1F3FC}", "\u{1F44B 1F3FD}", "\u{1F44B 1F3FE}", "\u{1F44B 1F3FF}", "\u{1F44C 1F3FB}", "\u{1F44C 1F3FC}", "\u{1F44C 1F3FD}", "\u{1F44C 1F3FE}", "\u{1F44C 1F3FF}", "\u{1F44D 1F3FB}", "\u{1F44D 1F3FC}", "\u{1F44D 1F3FD}", "\u{1F44D 1F3FE}", "\u{1F44D 1F3FF}", "\u{1F44E 1F3FB}", "\u{1F44E 1F3FC}", "\u{1F44E 1F3FD}", "\u{1F44E 1F3FE}", "\u{1F44E 1F3FF}", "\u{1F44F 1F3FB}", "\u{1F44F 1F3FC}", "\u{1F44F 1F3FD}", "\u{1F44F 1F3FE}", "\u{1F44F 1F3FF}", "\u{1F450 1F3FB}", "\u{1F450 1F3FC}", "\u{1F450 1F3FD}", "\u{1F450 1F3FE}", "\u{1F450 1F3FF}", "\u{1F466 1F3FB}", "\u{1F466 1F3FC}", "\u{1F466 1F3FD}", "\u{1F466 1F3FE}", "\u{1F466 1F3FF}", "\u{1F467 1F3FB}", "\u{1F467 1F3FC}", "\u{1F467 1F3FD}", "\u{1F467 1F3FE}", "\u{1F467 1F3FF}", "\u{1F468 1F3FB}", "\u{1F468 1F3FC}", "\u{1F468 1F3FD}", "\u{1F468 1F3FE}", "\u{1F468 1F3FF}", "\u{1F469 1F3FB}", "\u{1F469 1F3FC}", "\u{1F469 1F3FD}", "\u{1F469 1F3FE}", "\u{1F469 1F3FF}", "\u{1F46E 1F3FB}", "\u{1F46E 1F3FC}", "\u{1F46E 1F3FD}", "\u{1F46E 1F3FE}", "\u{1F46E 1F3FF}", "\u{1F470 1F3FB}", "\u{1F470 1F3FC}", "\u{1F470 1F3FD}", "\u{1F470 1F3FE}", "\u{1F470 1F3FF}", "\u{1F471 1F3FB}", "\u{1F471 1F3FC}", "\u{1F471 1F3FD}", "\u{1F471 1F3FE}", "\u{1F471 1F3FF}", "\u{1F472 1F3FB}", "\u{1F472 1F3FC}", "\u{1F472 1F3FD}", "\u{1F472 1F3FE}", "\u{1F472 1F3FF}", "\u{1F473 1F3FB}", "\u{1F473 1F3FC}", "\u{1F473 1F3FD}", "\u{1F473 1F3FE}", "\u{1F473 1F3FF}", "\u{1F474 1F3FB}", "\u{1F474 1F3FC}", "\u{1F474 1F3FD}", "\u{1F474 1F3FE}", "\u{1F474 1F3FF}", "\u{1F475 1F3FB}", "\u{1F475 1F3FC}", "\u{1F475 1F3FD}", "\u{1F475 1F3FE}", "\u{1F475 1F3FF}", "\u{1F476 1F3FB}", "\u{1F476 1F3FC}", "\u{1F476 1F3FD}", "\u{1F476 1F3FE}", "\u{1F476 1F3FF}", "\u{1F477 1F3FB}", "\u{1F477 1F3FC}", "\u{1F477 1F3FD}", "\u{1F477 1F3FE}", "\u{1F477 1F3FF}", "\u{1F478 1F3FB}", "\u{1F478 1F3FC}", "\u{1F478 1F3FD}", "\u{1F478 1F3FE}", "\u{1F478 1F3FF}", "\u{1F47C 1F3FB}", "\u{1F47C 1F3FC}", "\u{1F47C 1F3FD}", "\u{1F47C 1F3FE}", "\u{1F47C 1F3FF}", "\u{1F481 1F3FB}", "\u{1F481 1F3FC}", "\u{1F481 1F3FD}", "\u{1F481 1F3FE}", "\u{1F481 1F3FF}", "\u{1F482 1F3FB}", "\u{1F482 1F3FC}", "\u{1F482 1F3FD}", "\u{1F482 1F3FE}", "\u{1F482 1F3FF}", "\u{1F483 1F3FB}", "\u{1F483 1F3FC}", "\u{1F483 1F3FD}", "\u{1F483 1F3FE}", "\u{1F483 1F3FF}", "\u{1F485 1F3FB}", "\u{1F485 1F3FC}", "\u{1F485 1F3FD}", "\u{1F485 1F3FE}", "\u{1F485 1F3FF}", "\u{1F486 1F3FB}", "\u{1F486 1F3FC}", "\u{1F486 1F3FD}", "\u{1F486 1F3FE}", "\u{1F486 1F3FF}", "\u{1F487 1F3FB}", "\u{1F487 1F3FC}", "\u{1F487 1F3FD}", "\u{1F487 1F3FE}", "\u{1F487 1F3FF}", "\u{1F4AA 1F3FB}", "\u{1F4AA 1F3FC}", "\u{1F4AA 1F3FD}", "\u{1F4AA 1F3FE}", "\u{1F4AA 1F3FF}", "\u{1F574 1F3FB}", "\u{1F574 1F3FC}", "\u{1F574 1F3FD}", "\u{1F574 1F3FE}", "\u{1F574 1F3FF}", "\u{1F575 1F3FB}", "\u{1F575 1F3FC}", "\u{1F575 1F3FD}", "\u{1F575 1F3FE}", "\u{1F575 1F3FF}", "\u{1F57A 1F3FB}", "\u{1F57A 1F3FC}", "\u{1F57A 1F3FD}", "\u{1F57A 1F3FE}", "\u{1F57A 1F3FF}", "\u{1F590 1F3FB}", "\u{1F590 1F3FC}", "\u{1F590 1F3FD}", "\u{1F590 1F3FE}", "\u{1F590 1F3FF}", "\u{1F595 1F3FB}", "\u{1F595 1F3FC}", "\u{1F595 1F3FD}", "\u{1F595 1F3FE}", "\u{1F595 1F3FF}", "\u{1F596 1F3FB}", "\u{1F596 1F3FC}", "\u{1F596 1F3FD}", "\u{1F596 1F3FE}", "\u{1F596 1F3FF}", "\u{1F645 1F3FB}", "\u{1F645 1F3FC}", "\u{1F645 1F3FD}", "\u{1F645 1F3FE}", "\u{1F645 1F3FF}", "\u{1F646 1F3FB}", "\u{1F646 1F3FC}", "\u{1F646 1F3FD}", "\u{1F646 1F3FE}", "\u{1F646 1F3FF}", "\u{1F647 1F3FB}", "\u{1F647 1F3FC}", "\u{1F647 1F3FD}", "\u{1F647 1F3FE}", "\u{1F647 1F3FF}", "\u{1F64B 1F3FB}", "\u{1F64B 1F3FC}", "\u{1F64B 1F3FD}", "\u{1F64B 1F3FE}", "\u{1F64B 1F3FF}", "\u{1F64C 1F3FB}", "\u{1F64C 1F3FC}", "\u{1F64C 1F3FD}", "\u{1F64C 1F3FE}", "\u{1F64C 1F3FF}", "\u{1F64D 1F3FB}", "\u{1F64D 1F3FC}", "\u{1F64D 1F3FD}", "\u{1F64D 1F3FE}", "\u{1F64D 1F3FF}", "\u{1F64E 1F3FB}", "\u{1F64E 1F3FC}", "\u{1F64E 1F3FD}", "\u{1F64E 1F3FE}", "\u{1F64E 1F3FF}", "\u{1F64F 1F3FB}", "\u{1F64F 1F3FC}", "\u{1F64F 1F3FD}", "\u{1F64F 1F3FE}", "\u{1F64F 1F3FF}", "\u{1F6A3 1F3FB}", "\u{1F6A3 1F3FC}", "\u{1F6A3 1F3FD}", "\u{1F6A3 1F3FE}", "\u{1F6A3 1F3FF}", "\u{1F6B4 1F3FB}", "\u{1F6B4 1F3FC}", "\u{1F6B4 1F3FD}", "\u{1F6B4 1F3FE}", "\u{1F6B4 1F3FF}", "\u{1F6B5 1F3FB}", "\u{1F6B5 1F3FC}", "\u{1F6B5 1F3FD}", "\u{1F6B5 1F3FE}", "\u{1F6B5 1F3FF}", "\u{1F6B6 1F3FB}", "\u{1F6B6 1F3FC}", "\u{1F6B6 1F3FD}", "\u{1F6B6 1F3FE}", "\u{1F6B6 1F3FF}", "\u{1F6C0 1F3FB}", "\u{1F6C0 1F3FC}", "\u{1F6C0 1F3FD}", "\u{1F6C0 1F3FE}", "\u{1F6C0 1F3FF}", "\u{1F918 1F3FB}", "\u{1F918 1F3FC}", "\u{1F918 1F3FD}", "\u{1F918 1F3FE}", "\u{1F918 1F3FF}", "\u{1F919 1F3FB}", "\u{1F919 1F3FC}", "\u{1F919 1F3FD}", "\u{1F919 1F3FE}", "\u{1F919 1F3FF}", "\u{1F91A 1F3FB}", "\u{1F91A 1F3FC}", "\u{1F91A 1F3FD}", "\u{1F91A 1F3FE}", "\u{1F91A 1F3FF}", "\u{1F91B 1F3FB}", "\u{1F91B 1F3FC}", "\u{1F91B 1F3FD}", "\u{1F91B 1F3FE}", "\u{1F91B 1F3FF}", "\u{1F91C 1F3FB}", "\u{1F91C 1F3FC}", "\u{1F91C 1F3FD}", "\u{1F91C 1F3FE}", "\u{1F91C 1F3FF}", "\u{1F91E 1F3FB}", "\u{1F91E 1F3FC}", "\u{1F91E 1F3FD}", "\u{1F91E 1F3FE}", "\u{1F91E 1F3FF}", "\u{1F926 1F3FB}", "\u{1F926 1F3FC}", "\u{1F926 1F3FD}", "\u{1F926 1F3FE}", "\u{1F926 1F3FF}", "\u{1F930 1F3FB}", "\u{1F930 1F3FC}", "\u{1F930 1F3FD}", "\u{1F930 1F3FE}", "\u{1F930 1F3FF}", "\u{1F933 1F3FB}", "\u{1F933 1F3FC}", "\u{1F933 1F3FD}", "\u{1F933 1F3FE}", "\u{1F933 1F3FF}", "\u{1F934 1F3FB}", "\u{1F934 1F3FC}", "\u{1F934 1F3FD}", "\u{1F934 1F3FE}", "\u{1F934 1F3FF}", "\u{1F935 1F3FB}", "\u{1F935 1F3FC}", "\u{1F935 1F3FD}", "\u{1F935 1F3FE}", "\u{1F935 1F3FF}", "\u{1F936 1F3FB}", "\u{1F936 1F3FC}", "\u{1F936 1F3FD}", "\u{1F936 1F3FE}", "\u{1F936 1F3FF}", "\u{1F937 1F3FB}", "\u{1F937 1F3FC}", "\u{1F937 1F3FD}", "\u{1F937 1F3FE}", "\u{1F937 1F3FF}", "\u{1F938 1F3FB}", "\u{1F938 1F3FC}", "\u{1F938 1F3FD}", "\u{1F938 1F3FE}", "\u{1F938 1F3FF}", "\u{1F939 1F3FB}", "\u{1F939 1F3FC}", "\u{1F939 1F3FD}", "\u{1F939 1F3FE}", "\u{1F939 1F3FF}", "\u{1F93D 1F3FB}", "\u{1F93D 1F3FC}", "\u{1F93D 1F3FD}", "\u{1F93D 1F3FE}", "\u{1F93D 1F3FF}", "\u{1F93E 1F3FB}", "\u{1F93E 1F3FC}", "\u{1F93E 1F3FD}", "\u{1F93E 1F3FE}", "\u{1F93E 1F3FF}"]
      sequences.each do |sequence|
        result = @extractor.png(sequence)
        print '.'
        puts "Couldn't find PNG for #{sequence.split('').map { |cp| cp.ord.to_s(16) }} ( #{sequence} )" if result.nil?
        refute_nil result
      end
    end

    def test_mountain_biking_woman_with_skin_tone
      control_path = 'images/test/1f6b5-1f3ff-200d-2640-fe0f_control.png'
      new_path = 'images/test/1f6b5-1f3ff-200d-2640-fe0f.png'

      png_bytes = @extractor.png("\u{1F6B5 1F3FF 200D 2640}")
      File.open('images/test/1f6b5-1f3ff-200d-2640-fe0f.png', 'wb') { |f| f.write png_bytes }
      @file_cleanup_paths << new_path

      control_digest = Digest::MD5.hexdigest(File.read(control_path))
      new_png_digest = Digest::MD5.hexdigest(File.read(new_path))

      assert_equal control_digest, new_png_digest
    end

    def test_find_emoji_png_correct_dimensions
      new_path = 'images/test/1f4aa-1f3ff_size_test.png'

      png_bytes = @extractor.png("\u{1F4AA 1F3FF}")
      File.open(new_path, 'wb') { |f| f.write png_bytes }
      @file_cleanup_paths << new_path

      dimensions = FastImage.size(new_path)

      assert_equal dimensions[0], 64
      assert_equal dimensions[1], 64
    end

    def test_find_emoji_png_not_an_emoji
      png_bytes = @extractor.png("\u{0041}")
      assert_nil png_bytes
    end

    def test_person_and_woman_should_be_the_same
      person_png_bytes = @extractor.png("\u{1F645 1F3FB}")
      woman_png_bytes = @extractor.png("\u{1F645 1F3FB 200D 2640 FE0F}")
      assert_equal person_png_bytes, woman_png_bytes
    end

    def test_happy_woman_raising_one_hand
      png_bytes = @extractor.png("\u{1F64B 1F3FB 200D 2640 FE0F}")
      refute_nil png_bytes
    end
  end
end
