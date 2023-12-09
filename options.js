document.getElementById('saveButton').addEventListener('click', () => {
  var startdate = document.getElementById('startdate').value;
  var stopdate = document.getElementById('stopdate').value;
  chrome.storage.sync.set({ startdate, stopdate }, () => {
      alert('Settings saved.');
  });
});
