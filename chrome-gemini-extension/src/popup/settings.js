document.addEventListener("DOMContentLoaded", () => {
  console.log("Settings script: DOMContentLoaded fired.");
  const apiToken = document.getElementById("apiToken");
  const geminiModel = document.getElementById("geminiModel");
  const customPrompt = document.getElementById("customPrompt");

  const form = document.getElementById("settingsForm");
  const msg = document.getElementById("settingsMessage");
  const backButton = document.getElementById("backButton");

  // Log UI element presence
  console.log("Settings script: UI elements found:", {
    apiToken: !!apiToken,
    geminiModel: !!geminiModel,
    customPrompt: !!customPrompt,
    form: !!form,
    msg: !!msg,
    backButton: !!backButton,
  });

  // Carrega configurações salvas
  chrome.storage.sync.get(
    ["geminiApiToken", "geminiModel", "customPrompt"],
    (data) => {
      if (chrome.runtime.lastError) {
        console.error("Error loading settings:", chrome.runtime.lastError);
        return;
      }
      console.log("Settings script: Loaded settings:", data);
      const settings = data || {};
      apiToken.value = settings.geminiApiToken || "";
      geminiModel.value = settings.geminiModel || "gemini-1.5-pro";
      customPrompt.value = settings.customPrompt || "";
    },
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Settings script: Form submitted. Saving data...");

    const dataToSave = {
      geminiApiToken: apiToken.value.trim(),
      geminiModel: geminiModel.value,
      customPrompt: customPrompt.value.trim(),
    };
    console.log("Settings script: Data to save:", dataToSave);

    chrome.storage.sync.set(dataToSave, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving settings:", chrome.runtime.lastError);
        msg.textContent = "Erro ao salvar!";
        msg.style.color = "red";
        return;
      }
      console.log("Settings script: Settings saved successfully.");
      msg.textContent = "Configurações salvas!";
      msg.style.color = "green";
      setTimeout(() => (msg.textContent = ""), 2000);
    });
  });

  backButton.addEventListener("click", () => {
    console.log(
      "Settings script: Back button clicked. Redirecting to popup.html",
    );
    window.location.href = "popup.html";
  });
});
