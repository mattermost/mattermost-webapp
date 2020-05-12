// Helper to parse query string
export function getQueryStringValue(name) {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(window.location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Helper method to create random identifiers (e.g., transaction)
export function randomString(len) {
  var charSet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

export function convertVNstring(str) {
  try {
    let unicode_map = [
      { from: 'ÀÁẠÃẢàáạãảÂẦẤẬẪẨâầấậẫẩĂẰẮẶẴẲăằắặẵẳ', to: 'a' },
      { from: 'ÈÉẸẼẺèéẹẽẻÊỀẾỆỄỂêềếệễể', to: 'e' },
      { from: 'ỲÝỴỸỶỳýỵỹỷ', to: 'y' },
      { from: 'ÚÙỤŨỦúùụũủƯỨỪỰỮỬưứừựữử', to: 'u' },
      { from: 'ÍÌỊĨỈíìịĩỉ', to: 'i' },
      { from: 'ÓÒỌÕỎóòọõỏÔỐỒỘỖỔôốồộỗổƠỜỚỢỠỞơờớợỡở', to: 'o' },
      { from: 'Đđ', to: 'd' },
    ];
    let res = '';
    for (let i = 0; i < str.length; i++) {
      let found = false;
      for (let j = 0; j < unicode_map.length; j++) {
        if (unicode_map[j].from.indexOf(str.charAt(i)) !== -1) {
          res = res + unicode_map[j].to;
          found = true;
          break;
        }
      }
      if (!found) {
        res = res + str.charAt(i).toLowerCase();
      }
    }
    return res;
  } catch (err) {
    return '';
  }
}
