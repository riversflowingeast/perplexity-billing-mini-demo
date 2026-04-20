async function send() {
  const input = document.getElementById("input");
  const message = input.value;
  const scenarioId = parseInt(document.getElementById("scenario").value);

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, scenarioId })
  });

  const data = await res.json();

  const chat = document.getElementById("chat");

  chat.innerHTML += "<p><b>User:</b> " + message + "</p>";
  chat.innerHTML += "<p><b>Bot:</b> " + data.reply + "</p>";
  chat.innerHTML += "<p><i>Escalate: " + data.escalate + " (" + data.reason + ")</i></p>";

  input.value = "";
}