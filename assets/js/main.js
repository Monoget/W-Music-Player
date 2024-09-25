const mp3Files = [
    { name: "Karm hai tu moksh hai tu", path: "assets/music/Karm hai tu moksh hai tu.mp3" },
    { name: "Ram Siya Ram Lofi Version", path: "assets/music/Ram Siya Ram Lofi Version.mp3" },
    { name: "Sachet Parampara Shiv Tandav Stotram", path: "assets/music/Sachet Parampara  Shiv Tandav Stotram.mp3" }
];

$(document).ready(function () {
    const playlist = $('#playlist');
    const audioPlayer = $('#audioPlayer');
    const albumCover = $('#albumCover');

    // Load the playlist
    function loadPlaylist(files) {
        playlist.empty();
        files.forEach(file => {
            const playlistItem = $('<div></div>').addClass('playlist-item').text(file.name);
            playlistItem.data('src', file.path);

            // Click event to play the song
            playlistItem.on('click', function () {
                $('.playlist-item').removeClass('active-song');
                $(this).addClass('active-song');
                audioPlayer.attr('src', $(this).data('src'));
                audioPlayer[0].play();

                // Fetch album art from the selected file
                fetchAlbumArt($(this).data('src'));
            });

            playlist.append(playlistItem);
        });
    }

    // Fetch album art from the MP3 file using AJAX
    function fetchAlbumArt(src) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            if (xhr.status === 200) {
                const fileBlob = xhr.response;
                jsmediatags.read(fileBlob, {
                    onSuccess: function(tag) {
                        const albumArt = tag.tags.picture;
                        if (albumArt) {
                            const base64String = arrayBufferToBase64(albumArt.data);
                            albumCover.attr('src', 'data:' + albumArt.format + ';base64,' + base64String);
                        } else {
                            // If no album art found, set to default image
                            albumCover.attr('src', 'assets/images/default-cover.jpg');
                        }
                    },
                    onError: function(error) {
                        console.error('Error reading tags:', error);
                        albumCover.attr('src', 'assets/images/default-cover.jpg'); // Fallback on error
                    }
                });
            } else {
                console.error('Failed to fetch file:', xhr.status);
                albumCover.attr('src', 'assets/images/default-cover.jpg'); // Fallback on error
            }
        };
        xhr.onerror = function () {
            console.error('Error fetching file.');
            albumCover.attr('src', 'assets/images/default-cover.jpg'); // Fallback on error
        };
        xhr.send();
    }

    loadPlaylist(mp3Files);
});

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}