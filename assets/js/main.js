// Sample list of MP3 files
const mp3Files = [
    { name: "Karm hai tu moksh hai tu", path: "assets/music/Karm hai tu moksh hai tu.mp3" },
    { name: "Ram Siya Ram Lofi Version", path: "assets/music/Ram Siya Ram Lofi Version.mp3" },
    { name: "Sachet Parampara Shiv Tandav Stotram", path: "assets/music/Sachet Parampara Shiv Tandav Stotram.mp3" }
];

// jQuery function to load the playlist dynamically
$(document).ready(function () {
    const playlist = $('#playlist');
    const audioPlayer = $('#audioPlayer');
    const albumCover = $('#albumCover');

    // Load the playlist initially
    function loadPlaylist(files) {
        playlist.empty();
        if (files.length === 0) {
            playlist.append('<div class="no-results">No results found</div>');
            return;
        }
        files.forEach((file, index) => {
            const playlistItem = $('<div></div>').addClass('playlist-item').text(file.name);
            playlistItem.data('src', file.path);

            // Handle click event to play the selected song
            playlistItem.on('click', function () {
                $('.playlist-item').removeClass('active-song');
                $(this).addClass('active-song');
                audioPlayer.attr('src', $(this).data('src'));
                audioPlayer[0].play();

                // Read and set album cover using jsmediatags
                jsmediatags.read(file.path, {
                    onSuccess: function (tag) {
                        const image = tag.tags.picture;
                        if (image) {
                            const base64String = image.data.reduce((data, byte) => data + String.fromCharCode(byte), '');
                            const base64 = 'data:' + image.format + ';base64,' + window.btoa(base64String);
                            albumCover.attr('src', base64);  // Set the cover image dynamically
                        } else {
                            albumCover.attr('src', 'assets/images/default-cover.jpg'); // Fallback to default cover
                        }
                    },
                    onError: function (error) {
                        console.log('Error reading metadata: ', error);
                        albumCover.attr('src', 'assets/images/default-cover.jpg'); // Fallback to default cover
                    }
                });
            });

            playlist.append(playlistItem);
        });
    }

    // Initial load of the playlist
    loadPlaylist(mp3Files);

    // Live search function
    $('#searchBox').on('input', function () {
        const query = $(this).val().toLowerCase();
        const filteredFiles = mp3Files.filter(file => file.name.toLowerCase().includes(query));
        loadPlaylist(filteredFiles);
    });
});