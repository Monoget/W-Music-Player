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
    const volumeButton = document.getElementById('volumeButton');
    const volumeSlider = document.getElementById('volumeSlider');

    let isPlaying = false;

    // Set initial volume
    audioPlayer.volume = volumeBar.val() / 100;

    // Load the appropriate playlist based on the current page
    let currentPlaylist = loadPlaylistByPage();

    // Load the playlist into the UI
    loadPlaylist(currentPlaylist);

    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const filteredFiles = currentPlaylist.filter(file => file.name.toLowerCase().includes(query));
        loadPlaylist(filteredFiles);
    });

    // Previous and next song buttons
    document.getElementById('playPreviousSong').addEventListener('click', playPreviousSong);
    document.getElementById('playNextSong').addEventListener('click', playNextSong);

    // Load the playlist based on the current page
    function loadPlaylistByPage() {
        const currentPage = window.location.pathname.split('/').pop(); // Get the current page name
        switch (currentPage) {
            case 'index.html':
                return mp3FilesIndex;
            case 'latest.html':
                return mp3FilesLatest;
            case 'krishna.html':
                return mp3FilesKrishna;
            case 'classic.html':
                return mp3FilesClassic;
            case 'bromho.html':
                return mp3FilesBromho;
            case 'montro.html':
                return mp3FilesMontro;
            case 'matri.html':
                return mp3FilesMatri;
            default:
                return mp3FilesIndex;
        }
    }

    // Load the playlist
    function loadPlaylist(files) {
        playlist.empty();
        files.forEach((file, index) => {
            const playlistItem = $('<div></div>').addClass('playlist-item').text(`${index + 1}. ${file.name}`);
            playlistItem.data('src', file.path);

            // Click event to play the song
            playlistItem.on('click', function () {
                playSelectedSong($(this));
            });

            playlist.append(playlistItem);
        });
    }

    // Function to play a selected song
    function playSelectedSong(item) {
        $('.playlist-item').removeClass('active-song');
        item.addClass('active-song');
        audioPlayer.src = item.data('src');
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseIcon();
        fetchAlbumArt(item.data('src'));
        playableSongName.text(item.text());
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


    // Play/pause button functionality
    playPauseBtn.on('click', function () {
        if (!isPlaying) {
            // Check if there's a song in the playlist
            if (currentPlaylist.length > 0) {
                // Play the first song if nothing is currently playing
                const firstSong = currentPlaylist[0]; // Reference to the first song
                audioPlayer.src = firstSong.path;
                $('#playableSongName').text(firstSong.name);
                fetchAlbumArt(firstSong.path);
                audioPlayer.play();
                isPlaying = true;
                updatePlayPauseIcon();

                // Add active class to the first song in the playlist
                $('.playlist-item').removeClass('active-song'); // Remove active class from any previously active song
                $('.playlist-item').first().addClass('active-song'); // Add active class to the first song
            }
        } else {
            // Pause the currently playing song
            audioPlayer.pause();
            isPlaying = false;
            updatePlayPauseIcon();
        }
    });



    // Update play/pause button icon
    function updatePlayPauseIcon() {
        playPauseBtn.html(isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>');
    }

    // Update the seek bar and time
    audioPlayer.addEventListener('timeupdate', function () {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration || 0;

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
        updateVolumeIcon(volumeBar.val());
    });

    // Format time (in seconds) to mm:ss
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update volume icon
    function updateVolumeIcon(volumeLevel) {
        if (volumeLevel == 0) {
            volumeIcon.className = 'fa-solid fa-volume-mute';
        } else if (volumeLevel <= 33) {
            volumeIcon.className = 'fa-solid fa-volume-off';
        } else if (volumeLevel <= 66) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
        }
    }

    // Toggle the volume slider display
    volumeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        volumeSlider.style.display = (volumeSlider.style.display === 'block') ? 'none' : 'block';
    });

    // Hide the volume slider when clicking elsewhere
    document.addEventListener('click', function (event) {
        if (volumeSlider.style.display === 'block' && !volumeButton.contains(event.target) && !volumeSlider.contains(event.target)) {
            volumeSlider.style.display = 'none';
        }
    });

    // Play the previous song
    function playPreviousSong() {
        const currentIndex = $('.playlist-item.active-song').index();
        if (currentIndex > 0) {
            const prevSong = $('.playlist-item').eq(currentIndex - 1);
            playSelectedSong(prevSong);
        }
    }

    // Play the next song
    function playNextSong() {
        const currentIndex = $('.playlist-item.active-song').index();
        const nextSong = $('.playlist-item').eq(currentIndex + 1);
        if (nextSong.length) {
            playSelectedSong(nextSong);
        }
    }
});

// Helper function to convert array buffer to base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
