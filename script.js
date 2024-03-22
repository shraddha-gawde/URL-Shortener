let backendURL = `http://localhost:8080/url`;

let originalURL = document.getElementById("long-url");
let submitBtn = document.getElementById("submit");
let errorDiv = document.getElementById("error");
let newURL = document.getElementById("shorturl");
let statusDiv = document.getElementById("status");

submitBtn.addEventListener("click", () => {
  if (originalURL.value == "") {
    errorDiv.innerText = "Please Enter your URL";
  } else {
    getShortURL(originalURL.value);
  }
});
async function getShortURL(url) {
  try {
    let res = await fetch(`${backendURL}/original`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        originalURL: url,
      }),
    });
    let data = await res.json();
    console.log(data.newURL);
    newURL.textContent = data.newURL;
  } catch (error) {
    console.log(error);
  }
}

//copying shorturl to clipboard
const copyButton = document.getElementById("copy");

if (copyButton && navigator.clipboard) {
  copyButton.addEventListener("click", async () => {
    const textToCopy = newURL.textContent;

    try {
      await navigator.clipboard.writeText(textToCopy);
      statusDiv.innerText = "URL copied to clipboard";

    } catch (err) {
      console.error("Unable to copy text to clipboard.", err);
    }
  });
} else {
  console.error(
    "Clipboard API not supported or copy button not found in this browser."
  );
}
