module EmojiConstants
  VS16 = "\u{fe0f}".freeze # VARIATION_SELECTOR_16
  ZWJ = "\u{200d}".freeze # ZERO_WIDTH_JOINER

  GENDER_MALE = "\u{2642}"
  GENDER_FEMALE = "\u{2640}"

  GENDER_MAP = {
    "M" => GENDER_MALE,
    "W" => GENDER_FEMALE,
  }.freeze

  SKIN_TONE_MAP_INDEX = {
    "1" => "\u{1F3FB}",
    "2" => "\u{1F3FC}",
    "3" => "\u{1F3FD}",
    "4" => "\u{1F3FE}",
    "5" => "\u{1F3FF}",
  }.freeze

  SKIN_TONE_MAP = {
    "\u{1F3FB}" => 'light skin tone',
    "\u{1F3FC}" => 'medium-light skin tone',
    "\u{1F3FD}" => 'medium skin tone',
    "\u{1F3FE}" => 'medium-dark skin tone',
    "\u{1F3FF}" => 'dark skin tone'
  }.freeze

  FAMILY_MAP = {
    "B" => "\u{1f466}",
    "G" => "\u{1f467}",
    "M" => "\u{1f468}",
    "W" => "\u{1f469}",
  }.freeze

  FAMILY = "1F46A".freeze
  COUPLE = "1F491".freeze
  KISS = "1F48F".freeze
  HANDSHAKE = "1F91D".freeze

  EMOJI_TTF = '/System/Library/Fonts/Apple Color Emoji.ttc'.freeze

  CATEGORY_NAMES = {
    "smileys & emotion" => "smileys",
    "people & body" => "people",
    "animals & nature" => "nature",
    "food & drink" => "food",
    "travel & places" => "places",
    "activities" => "activities",
    "objects" => "objects",
    "symbols" => "symbols",
    "flags" => "flags",
    "custom" => "custom"};
end