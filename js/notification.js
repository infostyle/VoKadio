/*
 * This file is part of VoKadio extension for Google Chrome browser
 * 
 * Copyright (c) 2007 - 2010 InfoStyle Company (http://infostyle.com.ua/)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var bp = chrome.extension.getBackgroundPage();

var AudioPlayer = bp.AudioPlayer;
var audio_player  = bp.audio_player;
var vk_session    = bp.vk_session;
var audio_helper  = bp.audio_helper;

var elc = new EventsListenersCollector();

var unload_client = new UnloadManagerClient(bp.unload_server);
unload_client.addHandler(elc.unloadAllListeners);


function updateAudioMeta(index, record)
{
    if ( index >= 0 && record ) {
        $('#buttons .next').html(audio_player.playlist()[audio_player.nextIndex()].title);
        
        $('#track-info .title').html(EXTENSION_NAME);
        
        $('#artist').text('');
        $('#album').remove();
        $('#album-art img').attr('src', 'icons/64x64.png');
        
        audio_helper.getTrackInfo(decodeHtml(record.artist), decodeHtml(record.title),
            function (track_info, rid) {
                var current_track = audio_player.playlist()[audio_player.currentIndex()];
                
                var crid = audio_helper.getTrackInfoRequestId(decodeHtml(current_track.artist),
                                                              decodeHtml(current_track.title));
                
                if (rid == crid) {
                    if (typeof track_info.track != 'undefined')
                        $('#track-info .title').text(track_info.track);
                    
                    if (typeof track_info.artist != 'undefined')
                        $('#artist').text(track_info.artist);
                    
                    if (typeof track_info.album != 'undefined') {
                        if ($('#album').length == 0) 
                            $('#metadata').append($('<li id="album"></li>'));
                        $('#album').text(track_info.album);
                    }
                    
                    if (track_info.cover && track_info.cover.medium) 
                        $('#album-art img').attr('src', track_info.cover.medium);
                }
            });
    }
}


var close_countdown = null;

function startCloseCountdown(timeout)
{
    timeout = timeout || 333;
    close_countdown = setTimeout(function () {
        if ( window )
            window.close();
    }, timeout);
}

function cancelCloseCountdown()
{
    clearTimeout(close_countdown);
}

function restartCloseCountdown(timeout)
{
    cancelCloseCountdown();
    
    if ( window )
        startCloseCountdown(timeout);
}

var mouse_in_window = false;

$('body').mouseover(function () {
    mouse_in_window = true;
    cancelCloseCountdown();
});

$('body').mouseout(function () {
    mouse_in_window = false;
    restartCloseCountdown(NOTIFICATION_TIMEOUT_SECOND);
});

$(document).ready(function () { startCloseCountdown(NOTIFICATION_TIMEOUT); });


var playlist = audio_player.playlist();
var currentIndex = audio_player.currentIndex();

if ( vk_session.hasSession() || playlist.length > 0 && currentIndex >= 0 )
    updateAudioMeta(currentIndex, playlist[currentIndex]);
else
    window.close();


elc.add(audio_player, AudioPlayer.EVENT_INDEX_CHANGED, function (event) {
    if ( ! mouse_in_window )
        restartCloseCountdown(NOTIFICATION_TIMEOUT);
    
    updateAudioMeta(event.index, event.index >= 0 ? this.playlist()[event.index] : null);
});
