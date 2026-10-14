from youtube_transcript_api import YouTubeTranscriptApi


def get_transcript(video_id):

    transcript = YouTubeTranscriptApi().fetch(video_id)

    transcript_data = []

    for t in transcript:

        transcript_data.append({
            "text": t.text,
            "start": t.start
        })

    return transcript_data