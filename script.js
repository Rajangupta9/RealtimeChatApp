const socket = io("http://localhost:5000", { transports: ["websocket"] });

let currentUser = "";

// Register user
document.getElementById("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();

    if (!username) return alert("Please enter a username!");

    socket.emit("send_username", username);
    currentUser = username;

    // Show the username on the top
    document.getElementById("displayName").innerText = username;
    document.getElementById("usernameDisplay").classList.remove("hidden");

    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("chatSection").classList.remove("hidden");
});

// Receive username confirmation
socket.on("username_received", (message) => {
    alert(message);
});

// Handle group message submission
document.getElementById("groupChatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("groupMessage").value.trim();

    if (!message) return;

    socket.emit("group_message", { sender: currentUser, message });
    document.getElementById("groupMessage").value = "";
});

// Handle private message submission
document.getElementById("privateChatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const receiver = document.getElementById("receiver").value.trim();
    const message = document.getElementById("privateMessage").value.trim();

    if (!receiver || !message) return alert("Enter recipient and message!");

    socket.emit("private_message", { sender: currentUser, receiver, message });
    document.getElementById("privateMessage").value = "";
});
// display join /leave notificaion 
socket.on("chat_notification", (data) => {
    const chatBox = document.getElementById("chatBox");
    
    chatBox.innerHTML += `<p class="chat-notification ${data.type}">
        ${data.message}
    </p>`;

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
});
// Display group messages
socket.on("receive_group_message", (msg) => {
    const chatBox = document.getElementById("chatBox");
    const isMyMessage = msg.sender === currentUser;

    chatBox.innerHTML += `<p class="chat-message ${isMyMessage ? 'my-message' : 'group-message'}">
        <strong>${msg.sender}:</strong> ${msg.message}
    </p>`;

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
});

// Display private messages
socket.on("receive_private_message", (msg) => {
    const chatBox = document.getElementById("chatBox");

    chatBox.innerHTML += `<p class="chat-message private-message">
        <strong>Private from ${msg.sender}:</strong> ${msg.message}
    </p>`;

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
});
