var kbit;
browser.storage.local.get("anki_kbit").then( result => {
    document.getElementById("tags").value = result.anki_kbit.tags.join(",");
    document.getElementById("back").value = result.anki_kbit.text;
    kbit = result.anki_kbit;
    browser.storage.local.remove("anki_kbit");
});

let submitBtn = document.getElementById("submit");
submitBtn.onclick = function() {
    let anki_note = {
        hid: kbit._id,
        front: '' + document.getElementById("front").value,
        back : '' + document.getElementById("back").value,
        tags : '' + document.getElementById("tags").value
    }
    if(anki_note.front == "" || anki_note.back == "" || anki_note.tags == "")
        return;

    browser.runtime.sendMessage({request: "addAnkiNote", newAnkiNote: anki_note});
    let winId = browser.windows.WINDOW_ID_CURRENT;
    browser.windows.remove(winId);
}
