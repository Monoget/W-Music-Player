$(document).ready(function () {
    const playlist = $('#playlist');
    const audioPlayer = $('#audioPlayer')[0];
    const albumCover = $('#albumCover');
    const playPauseBtn = $('#playPauseBtn');
    const seekBar = $('#seekBar');
    const volumeBar = $('#volumeBar');
    const currentTimeLabel = $('#currentTime');
    const totalTimeLabel = $('#totalTime');
    const playableSongName = $('#playableSongName');
    const volumeIcon = document.getElementById('volumeIcon');
    // Get references to the button and slider elements
    const volumeButton = document.getElementById('volumeButton');
    const slider = document.getElementById('volumeSlider');

    let isPlaying = false;

    audioPlayer.volume = volumeBar.val() / 100;

    // Load the appropriate playlist based on the current page
    let currentPlaylist = [];

    // Load the appropriate playlist based on the current page
    const currentPage = window.location.pathname.split('/').pop(); // Get the current page name
    if (currentPage === 'index.html') {
        currentPlaylist = mp3FilesIndex;
    } else if (currentPage === 'latest.html') {
        currentPlaylist = mp3FilesLatest;
    } else if (currentPage === 'krishna.html') {
        currentPlaylist = mp3FilesKrishna;
    } else if (currentPage === 'classic.html') {
        currentPlaylist = mp3FilesClassic;
    } else if (currentPage === 'bromho.html') {
        currentPlaylist = mp3FilesBromho;
    } else if (currentPage === 'montro.html') {
        currentPlaylist = mp3FilesMontro;
    } else if (currentPage === 'matri.html') {
        currentPlaylist = mp3FilesMatri;
    }

    // Load the playlist into the UI
    loadPlaylist(currentPlaylist);

    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const filteredFiles = currentPlaylist.filter(file => file.name.toLowerCase().includes(query));
        loadPlaylist(filteredFiles);
    });

    // Load the playlist
    function loadPlaylist(files) {
        playlist.empty();
        files.forEach((file, index) => {
            // Create a playlist item with a serial number
            const playlistItem = $('<div></div>').addClass('playlist-item').text(`${index + 1}. ${file.name}`);
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
                $('#playableSongName').text($(this).text());
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
                    onSuccess: function (tag) {
                        const albumArt = tag.tags.picture;
                        if (albumArt) {
                            const base64String = arrayBufferToBase64(albumArt.data);
                            albumCover.attr('src', 'data:' + albumArt.format + ';base64,' + base64String);
                        } else {
                            albumCover.attr('src', 'assets/images/default-cover.jpg');
                        }
                    },
                    onError: function (error) {
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

        // Change the icon based on the volume level
        updateVolumeIcon(volumeBar.val());
    });

    // Format time (in seconds) to mm:ss
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateVolumeIcon(volumeLevel) {
        if (volumeLevel == 0) {
            volumeIcon.className = 'fa-solid fa-volume-mute'; // Mute icon
        } else if (volumeLevel <= 33) {
            volumeIcon.className = 'fa-solid fa-volume-off'; // Low volume icon
        } else if (volumeLevel <= 66) {
            volumeIcon.className = 'fa-solid fa-volume-low'; // Medium volume icon
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high'; // High volume icon
        }
    }

    // Toggle the slider display when the button is clicked
    volumeButton.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevent the click from bubbling up to the document
        if (slider.style.display === 'none' || slider.style.display === '') {
            slider.style.display = 'block'; // Show the slider
        } else {
            slider.style.display = 'none'; // Hide the slider
        }
    });

    // Hide the slider when clicking anywhere else on the document
    document.addEventListener('click', function (event) {
        if (slider.style.display === 'block') {
            // Check if the click is outside the button and the slider
            if (!volumeButton.contains(event.target) && !slider.contains(event.target)) {
                slider.style.display = 'none'; // Hide the slider
            }
        }
    });
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

