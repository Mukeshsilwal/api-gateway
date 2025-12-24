import { Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';

interface SocialShareProps {
    eventId: number;
    eventName: string;
    eventDescription?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ eventId, eventName, eventDescription }) => {
    const [copied, setCopied] = React.useState(false);
    const shareUrl = `${window.location.origin}/events/${eventId}`;
    const shareText = `Check out ${eventName}!`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    return (
        <div className="flex items-center gap-2">
            <Share2 className="text-gray-600 dark:text-gray-400" size={20} />
            <button
                onClick={shareOnFacebook}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="Share on Facebook"
            >
                <Facebook size={18} />
            </button>
            <button
                onClick={shareOnTwitter}
                className="p-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                title="Share on Twitter"
            >
                <Twitter size={18} />
            </button>
            <button
                onClick={shareOnLinkedIn}
                className="p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                title="Share on LinkedIn"
            >
                <Linkedin size={18} />
            </button>
            <button
                onClick={copyToClipboard}
                className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                title="Copy link"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
        </div>
    );
};

export default SocialShare;
