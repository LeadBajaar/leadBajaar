import Echo from 'laravel-echo';
import { authorize } from '@/lib/api';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                authorize({
                    socket_id: socketId,
                    channel_name: channel.name
                })

                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 80,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 443,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],

});
