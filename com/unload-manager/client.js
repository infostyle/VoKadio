/*
 * Client for UnloadManagerServer, which is responsible for registering of
 * unload handler.
 * 
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

function UnloadManagerClient(server)
{
    var handlers = [];
    
    this.addHandler = function (handler)
    {
        handlers.push(handler);
    };
    
    var connection_name = '' + (new Date()).getTime() + Math.random();
    
    server.registerHandler(connection_name, function () {
        while ( handlers.length > 0) {
            try { handlers.pop()(); }
            catch ( error ) {}
        }
    });
    
    chrome.extension.connect({ name: connection_name });
}
