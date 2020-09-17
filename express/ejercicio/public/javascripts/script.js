const ws = new WebSocket("ws://localhost:3000");
ws.onmessage = (msg) => {
  renderMessages(JSON.parse(msg.data));
};

const renderMessages = (data) => {
  const html = data.map((item) => `<p>${item}</p>`).join(" ");
  document.getElementById("messages").innerHTML = html;
};

const handleSubmit = (evt) => {
  evt.preventDefault();
  let a = document.getElementById("author");
  let t = new Date().getTime();
  const message = document.getElementById("message");
  let me = {
    mensaje : message.value,
    autor:a.value,
    tiempo:t
  }
  ws.send(JSON.stringify(me));
  message.value = "";
  a.value = "";
};

const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit);
