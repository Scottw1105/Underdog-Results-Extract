document.getElementById('saveButton').addEventListener('click', () => {
    var stopdate = document.getElementById('stopdate').value;
    chrome.storage.sync.set({ stopdate }, () => {
      alert('Settings saved.');
    });
  });
  