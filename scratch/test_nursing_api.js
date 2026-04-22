
async function test() {
  try {
    const res = await fetch('https://sooyusil.com/api/nursingRoomJSON.do');
    const text = await res.text();
    console.log(text.substring(0, 500));
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
test();
