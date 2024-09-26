const mp3Files = [
    { name: "Karm hai tu moksh hai tu", path: "assets/music/Karm hai tu moksh hai tu.mp3" },
    { name: "Ram Siya Ram Lofi Version", path: "assets/music/Ram Siya Ram Lofi Version.mp3" },
    { name: "Sachet Parampara Shiv Tandav Stotram", path: "assets/music/Sachet Parampara  Shiv Tandav Stotram.mp3" }
];

$(document).ready(function () {
    const playlist = $('#playlist');
    const audioPlayer = $('#audioPlayer')[0];
    const albumCover = $('#albumCover');
    const playPauseBtn = $('#playPauseBtn');
    const seekBar = $('#seekBar');
    const volumeBar = $('#volumeBar');
    const currentTimeLabel = $('#currentTime');
    const totalTimeLabel = $('#totalTime');

    let isPlaying = false;

    audioPlayer.volume=volumeBar.val()/100;

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
                audioPlayer.src = $(this).data('src');
                audioPlayer.play();
                isPlaying = true;
                updatePlayPauseIcon();
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
                            albumCover.attr('src', 'assets/images/default-cover.jpg');
                        }
                    },
                    onError: function(error) {
                        console.error('Error reading tags:', error);
                        albumCover.attr('src', 'assets/images/default-cover.jpg');
                    }
                });
            } else {
                console.error('Failed to fetch file:', xhr.status);
                albumCover.attr('src', 'assets/images/default-cover.jpg');
            }
        };
        xhr.onerror = function () {
            console.error('Error fetching file.');
            albumCover.attr('src', 'assets/images/default-cover.jpg');
        };
        xhr.send();
    }

    // Play/pause button
    playPauseBtn.on('click', function () {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseIcon();
    });

    // Update play/pause button icon
    function updatePlayPauseIcon() {
        if (isPlaying) {
            playPauseBtn.html('<i class="fas fa-pause"></i>');
        } else {
            playPauseBtn.html('<i class="fas fa-play"></i>');
        }
    }

    // Update the seek bar and time
    audioPlayer.addEventListener('timeupdate', function () {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;

        seekBar.val((currentTime / duration) * 100);
        currentTimeLabel.text(formatTime(currentTime));
        totalTimeLabel.text(formatTime(duration));
    });

    // Seek bar change
    seekBar.on('input', function () {
        const seekTo = (audioPlayer.duration / 100) * seekBar.val();
        audioPlayer.currentTime = seekTo;
    });

    // Volume control
    volumeBar.on('input', function () {
        audioPlayer.volume = volumeBar.val() / 100;
    });

    // Format time (in seconds) to mm:ss
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
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

