'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Globe,
  Edit2,
  Loader2,
  FileText,
  BookOpen,
  Video,
  Activity,
  User as UserIcon,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { updateAuthor } from './actions';

interface SocialLinks {
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
}

interface AuthorCardProps {
  author: {
    id: string;
    displayName: string;
    slug: string;
    bio: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
    socialLinks: any;
    user: {
      fullName: string;
      email: string;
      avatarUrl: string | null;
      role: {
        name: string;
      };
      _count: {
        articles: number;
      };
    };
    _count: {
      webStories: number;
      videos: number;
      liveBlogs: number;
    };
  };
}

export function AuthorCard({ author }: AuthorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Parse social links safely
  let social: SocialLinks = {};
  if (author.socialLinks && typeof author.socialLinks === 'object') {
    social = author.socialLinks as SocialLinks;
  } else if (typeof author.socialLinks === 'string') {
    try {
      social = JSON.parse(author.socialLinks) as SocialLinks;
    } catch (_) {}
  }

  // Form states
  const [displayName, setDisplayName] = useState(author.displayName);
  const [bio, setBio] = useState(author.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(author.avatarUrl || '');
  const [isVerified, setIsVerified] = useState(author.isVerified);
  const [twitter, setTwitter] = useState(social.twitter || '');
  const [facebook, setFacebook] = useState(social.facebook || '');
  const [linkedin, setLinkedin] = useState(social.linkedin || '');
  const [instagram, setInstagram] = useState(social.instagram || '');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const res = await updateAuthor({
          id: author.id,
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          isVerified,
          socialLinks: {
            twitter: twitter.trim() || null,
            facebook: facebook.trim() || null,
            linkedin: linkedin.trim() || null,
            instagram: instagram.trim() || null,
          },
        });

        if (res.success) {
          toast.success('Author profile updated successfully!');
          setIsOpen(false);
        } else {
          toast.error('Failed to update author profile');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to update author profile');
      }
    });
  };

  const currentAvatar = author.avatarUrl || author.user.avatarUrl;
  const initialLetter = author.displayName ? author.displayName.charAt(0).toUpperCase() : 'A';

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative">
        
        {/* Verification badge & Edit button in absolute positioning inside header */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {author.isVerified && (
            <span className="text-blue-500 dark:text-blue-400" title="Verified Author">
              <CheckCircle2 className="h-5 w-5 fill-blue-500/10 shrink-0" />
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50" onClick={() => setIsOpen(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Identity */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
            {currentAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentAvatar} alt={author.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400">{initialLetter}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate pr-12">
              {author.displayName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {author.user.role.name}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
              {author.user.email}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="flex-1 mb-4">
          <p className="text-sm text-zinc-650 dark:text-zinc-350 line-clamp-3 leading-relaxed">
            {author.bio || <span className="italic text-zinc-400 dark:text-zinc-500">No biography provided.</span>}
          </p>
        </div>

        {/* Content Counts Grid */}
        <div className="grid grid-cols-4 gap-2 py-3 px-2 border-y border-zinc-100 dark:border-zinc-800 text-center mb-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
          <div>
            <div className="flex justify-center text-zinc-400 dark:text-zinc-500 mb-0.5">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-bold text-zinc-850 dark:text-zinc-150">{author.user._count?.articles ?? 0}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">News</div>
          </div>
          <div>
            <div className="flex justify-center text-zinc-400 dark:text-zinc-500 mb-0.5">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-bold text-zinc-850 dark:text-zinc-150">{author._count?.webStories ?? 0}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Stories</div>
          </div>
          <div>
            <div className="flex justify-center text-zinc-400 dark:text-zinc-500 mb-0.5">
              <Video className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-bold text-zinc-850 dark:text-zinc-150">{author._count?.videos ?? 0}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Videos</div>
          </div>
          <div>
            <div className="flex justify-center text-zinc-400 dark:text-zinc-500 mb-0.5">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-bold text-zinc-850 dark:text-zinc-150">{author._count?.liveBlogs ?? 0}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Blogs</div>
          </div>
        </div>

        {/* Social Links Footer */}
        <div className="flex items-center gap-2.5">
          {social.twitter && (
            <a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900 transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
          )}
          {social.facebook && (
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-blue-600 hover:border-blue-100 dark:hover:border-blue-900 transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {social.linkedin && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-blue-750 hover:border-blue-100 dark:hover:border-blue-900 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {social.instagram && (
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-pink-600 hover:border-pink-100 dark:hover:border-pink-900 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {!social.twitter && !social.facebook && !social.linkedin && !social.instagram && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              No social links
            </span>
          )}
        </div>
      </div>

      {/* Edit Author Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Author Profile</DialogTitle>
            <DialogDescription>
              Update display details, bio, verification status, and social channels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            {/* Display Name */}
            <div className="space-y-1">
              <label htmlFor="edit-displayName" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Display Name *
              </label>
              <input
                id="edit-displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label htmlFor="edit-bio" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Bio
              </label>
              <textarea
                id="edit-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Author professional bio..."
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors resize-none"
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-1">
              <label htmlFor="edit-avatarUrl" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Avatar URL (Overrides user account avatar)
              </label>
              <input
                id="edit-avatarUrl"
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
              />
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2 py-1">
              <input
                id="edit-isVerified"
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-950 dark:focus:ring-zinc-300 cursor-pointer"
              />
              <label htmlFor="edit-isVerified" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                Verified Author (Displays blue verification checkmark)
              </label>
            </div>

            {/* Social Links Section */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3 mt-2">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Social Channels</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="edit-twitter" className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Twitter URL
                  </label>
                  <input
                    id="edit-twitter"
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/profile"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-50 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-facebook" className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Facebook URL
                  </label>
                  <input
                    id="edit-facebook"
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/profile"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-50 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-linkedin" className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    LinkedIn URL
                  </label>
                  <input
                    id="edit-linkedin"
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/profile"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-50 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-instagram" className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Instagram URL
                  </label>
                  <input
                    id="edit-instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/profile"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-50 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-150 dark:border-zinc-800">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
