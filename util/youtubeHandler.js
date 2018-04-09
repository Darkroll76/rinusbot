const req = require('./request.js');
const yt  = require('ytdl-core');
const key = require('../src/config.json').keys.youtube;

module.exports = {

    async search(q) {

        const results = await req.get('https://www.googleapis.com/youtube/v3/search', {
            type: 'video',
            q,
            maxResults: 1,
            part: 'snippet',
            key,
        })
        .catch((error) => console.error(error));
        return results.items;
    },

    async getPlaylist(playlistId, limit = 100, pageToken, videos = []) {

        const result = await req.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            maxResults    : 50,
            part          : 'snippet',
            nextPageToken : null,
            pageToken,
            playlistId,
            key
        }).catch(() => null);

        if (!result || !result.body || result.body.items.length === 0)
            return videos;

        for (const video of result.body.items)
            videos.push({ id: video.snippet.resourceId.videoId, title: video.snippet.title });

        if (videos.length >= limit)
            return videos.slice(0, limit);

        if (result.body.nextPageToken)
            return await module.exports.getPlaylist(id, limit, result.body.nextPageToken, videos);

        return videos;
    },

    async videoInfo(id) {

        const result = await req.get('https://www.googleapis.com/youtube/v3/videos', {
            part : 'snippet',
            id,
            key
        }).catch(() => { body: { items: []}});

        if (result.body.items.length === 0) return [];
        return [{ id: result.body.items[0].id, title: result.body.items[0].snippet.title }];
    },

    async getFormats(id) {

        const info = await yt.getInfo(id).catch(() => null);

        if (!info || !info.formats)
            return null;

        //const formats = yt.filterFormats(info.formats, 'audioonly');
        const formats = info.formats.filter(fmt => ['251', '250', '249'].includes(fmt.itag)); // opus-only
        formats.sort((a, b) => b.itag - a.itag);

        return formats.length > 0 ? formats[0].url : null;
    },

    async getDuration(id) {
        const result = await req.get('https://www.googleapis.com/youtube/v3/videos', {
            part : 'contentDetails',
            id,
            key
        }).catch(() => null);

        if (!result || !result.body || result.body.items.length === 0)
            return 0;

        return module.exports.getSeconds(result.body.items[0].contentDetails.duration);
    },

    getSeconds(duration) {
        const match   = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

        if (!match)
            return 0;

        const hours   = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        return `${hours}:${minutes}:${seconds}`;
    }

};
