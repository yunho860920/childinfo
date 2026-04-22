
async function test() {
  const apiKey = 'YOUR_KEY_HERE'; // I'll use the one from env if I can, but I'll test with a placeholder first to see structure
  const url = `http://api.data.go.kr/openapi/tn_pubr_public_nursing_room_api?serviceKey=placeholder&type=json&numOfRows=10`;
  console.log('Testing URL:', url);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
test();
