'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, Save, Eye, ArrowLeft, Check, AlertTriangle, FileText, Settings, 
  ImagePlus, Menu, Copy, Trash, Send, ExternalLink, ImageIcon, HelpCircle,
  Info as InfoIcon, Trash2, Link
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/app/providers';
import { slugify } from '@/lib/utils';
import { ImageUpload } from '@/components/blog/image-upload';
import { Preview } from '@/components/blog/preview';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReadingTime } from '@/components/blog/reading-time';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { uploadImage, generateStoragePath } from '@/lib/storage-utils';
import { cn } from '@/lib/utils';
import { KeyboardShortcuts } from '@/components/blog/keyboard-shortcuts';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '@/components/ui/hover-card';
import { revalidateBlogPost, revalidateAllBlogPosts } from '@/lib/revalidation';

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
}) as any;

interface ImageData {
  url: string;
  alt: string;
  title: string;
  description: string;
  width: number;
  height: number;
  loading: 'lazy' | 'eager';
}

interface BlogPost {
  title: string;
  slug: string;
  permalink: string;
  isCustomPermalink?: boolean;
  excerpt: string;
  content: string;
  coverImage: string;
  status: 'draft' | 'published';
  publishedAt: Timestamp | null;
  author: {
    name: string;
    avatar: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl?: string;
    ogImage?: string;
    noIndex: boolean;
  };
  readingTime?: string;
  categories: string[];
  tags: string[];
  id?: string;
}

interface PageParams {
  action: string;
  id: string;
}

type Props = {
  params: {
    action: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const BASE_URL = 'https://nayabharatyojana.in/blog/';

interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export default function BlogPostEditor({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params) as PageParams;
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    permalink: '',
    isCustomPermalink: false,
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'draft',
    publishedAt: null,
    author: {
      name: '',
      avatar: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      noIndex: false
    },
    categories: [],
    tags: [],
    readingTime: ''
  });

  // Debounce the post state for auto-save
  const [debouncedPost] = useDebounce(post, 2000);

  // Auto-save function
  const autoSave = useCallback(async () => {
    // Skip auto-save if any required data is missing
    if (!user || !isAdmin || resolvedParams.action !== 'edit' || !resolvedParams.id || !db) {
      console.warn('Auto-save skipped: missing required data');
      return;
    }

    // Skip auto-save if there's no content to save
    if (!debouncedPost.content.trim()) {
      return;
    }

    try {
      setAutoSaveStatus({ status: 'saving', lastSaved: new Date() });
      
      // Verify admin status again before saving
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists() || !userDocSnap.data()?.isAdmin) {
        console.warn('Auto-save skipped: user is not an admin');
        setAutoSaveStatus(prev => ({ 
          status: 'error', 
          error: 'Permission denied',
          lastSaved: prev.lastSaved 
        }));
        return;
      }
      
      const docRef = doc(db, 'blog_posts', resolvedParams.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Only save fields that have changed
        const currentData = docSnap.data() as BlogPost;
        const updatedFields: Partial<BlogPost> = {};
        
        // Check which fields have changed
        if (debouncedPost.title !== currentData.title) updatedFields.title = debouncedPost.title;
        if (debouncedPost.content !== currentData.content) updatedFields.content = debouncedPost.content;
        if (debouncedPost.excerpt !== currentData.excerpt) updatedFields.excerpt = debouncedPost.excerpt;
        if (debouncedPost.slug !== currentData.slug) updatedFields.slug = debouncedPost.slug;
        if (debouncedPost.permalink !== currentData.permalink) updatedFields.permalink = debouncedPost.permalink;
        
        // Handle arrays properly
        if (JSON.stringify(debouncedPost.categories) !== JSON.stringify(currentData.categories)) {
          updatedFields.categories = Array.isArray(debouncedPost.categories) ? debouncedPost.categories : [];
        }
        
        if (JSON.stringify(debouncedPost.tags) !== JSON.stringify(currentData.tags)) {
          updatedFields.tags = Array.isArray(debouncedPost.tags) ? debouncedPost.tags : [];
        }
        
        // Only update if there are changes
        if (Object.keys(updatedFields).length > 0) {
          await updateDoc(docRef, {
            ...updatedFields,
            updatedAt: Timestamp.now(),
            status: 'draft'
          });
          
          setAutoSaveStatus({ status: 'saved', lastSaved: new Date() });
          toast.success('Draft saved automatically');
        } else {
          // No changes to save
          setAutoSaveStatus({ status: 'saved', lastSaved: new Date() });
        }
      } else if (resolvedParams.action !== 'edit') {
        // For new posts, we'll create the document if it doesn't exist
        await setDoc(docRef, {
          ...debouncedPost,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          status: 'draft',
          // Ensure categories and tags are arrays
          categories: Array.isArray(debouncedPost.categories) ? debouncedPost.categories : [],
          tags: Array.isArray(debouncedPost.tags) ? debouncedPost.tags : []
        });
        
        setAutoSaveStatus({ status: 'saved', lastSaved: new Date() });
        toast.success('New draft created automatically');
      } else {
        // Document doesn't exist but we're in edit mode - this is expected for new posts
        console.warn('Document does not exist for auto-save');
        // Don't show an error to the user, just update the status silently
        setAutoSaveStatus(prev => ({ 
          status: 'idle', 
          lastSaved: prev.lastSaved 
        }));
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus(prev => ({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to auto-save',
        lastSaved: prev.lastSaved 
      }));
      
      if (error instanceof Error && error.message.includes('permission')) {
        toast.error('Permission denied: Auto-save failed');
      } else {
        toast.error('Failed to auto-save draft');
      }
    }
  }, [debouncedPost, user, isAdmin, resolvedParams.action, resolvedParams.id, db]);

  // Effect for auto-save - only trigger when content actually changes
  useEffect(() => {
    // Only auto-save if we have content and we're in edit mode
    if (debouncedPost.content && resolvedParams.action === 'edit' && resolvedParams.id && db) {
      autoSave();
    }
  }, [debouncedPost, autoSave, resolvedParams.action, resolvedParams.id, db]);

  useEffect(() => {
    if (!user) {
      router.push('/auth?redirect=/admin/blog/' + resolvedParams.action + '/' + resolvedParams.id);
      return;
    }

    async function checkAdminAndFetchPost() {
      setLoading(true);
      try {
        if (!db) {
          console.error('Firestore not initialized');
          router.push('/');
          return;
        }

        const userDocRef = doc(db, 'users', user!.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists() || !userDocSnap.data()?.isAdmin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);

        if (resolvedParams.action === 'edit' && resolvedParams.id) {
          try {
            const docRef = doc(db, 'blog_posts', resolvedParams.id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setPost(docSnap.data() as BlogPost);
            }
          } catch (error) {
            console.error('Error fetching post:', error);
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
      setLoading(false);
    }

    checkAdminAndFetchPost();
  }, [user, resolvedParams.action, resolvedParams.id, router, db]);

  useEffect(() => {
    if (post.title && !post.permalink) {
      const newSlug = slugify(post.title);
      const newPermalink = `${BASE_URL}${newSlug}`;
      setPost(prev => ({
        ...prev,
        slug: newSlug,
        permalink: newPermalink
      }));
    }
  }, [post.title]);

  const handleTitleChange = (newTitle: string) => {
    const newSlug = slugify(newTitle);
    setPost(prev => ({ 
      ...prev, 
      title: newTitle,
      slug: newSlug,
      ...((!prev.isCustomPermalink) && {
        permalink: `${BASE_URL}${newSlug}`
      })
    }));
  };

  const handleSlugChange = (newSlug: string) => {
    const slugified = slugify(newSlug);
    setPost(prev => ({ 
      ...prev, 
      slug: slugified,
      permalink: `${BASE_URL}${slugified}`,
      isCustomPermalink: true
    }));
  };

  const handlePermalinkChange = (newPermalink: string) => {
    setPost(prev => ({
      ...prev,
      permalink: newPermalink,
      isCustomPermalink: true
    }));
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!user || !isAdmin || !db) {
      console.error('Cannot save: user, admin status, or database not available');
      toast.error('You do not have permission to save this post');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      // Verify admin status again before saving
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists() || !userDocSnap.data()?.isAdmin) {
        toast.error('You do not have admin permissions');
        setSaving(false);
        return;
      }

      const postData = {
        ...post,
        status,
        ...((!post.isCustomPermalink) ? {
          slug: slugify(post.title),
          permalink: `${BASE_URL}${slugify(post.title)}`
        } : {
          slug: post.slug,
          permalink: post.permalink
        }),
        updatedAt: Timestamp.now(),
        author: {
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '/default-avatar.png'
        },
        // Ensure categories is always an array
        categories: Array.isArray(post.categories) ? post.categories : [],
        // Ensure tags is always an array
        tags: Array.isArray(post.tags) ? post.tags : []
      };

      if (status === 'published' && !post.publishedAt) {
        postData.publishedAt = Timestamp.now();
      }

      if (resolvedParams.action === 'edit' && resolvedParams.id) {
        const docRef = doc(db, 'blog_posts', resolvedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          await updateDoc(docRef, postData);
          toast.success('Post updated successfully');
        } else {
          await setDoc(docRef, postData);
          toast.success('New post created successfully');
        }
      } else {
        const newDocRef = doc(collection(db, 'blog_posts'));
        await setDoc(newDocRef, postData);
        toast.success('New post created successfully');
      }
      
      setPost(prev => ({
        ...prev,
        ...postData
      }));
      
      // Call the revalidation API to clear the cache
      if (status === 'published') {
        try {
          // Revalidate the specific blog post
          const success = await revalidateBlogPost(postData.slug);
          
          if (success) {
            toast.success('Blog post published and site updated');
          } else {
            toast.warning('Blog post published but site update may be delayed');
          }
        } catch (revalidateError) {
          console.error('Error revalidating blog pages:', revalidateError);
          toast.warning('Blog post published but site update may be delayed');
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving post:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        toast.error('Permission denied: You do not have access to save this post');
      } else {
        toast.error('Failed to save post. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Add auto-save status indicator component
  const AutoSaveIndicator = () => {
    if (autoSaveStatus.status === 'saving') {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Saving...</span>
        </div>
      );
    }

    if (autoSaveStatus.status === 'saved') {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
          <Check className="h-4 w-4" />
          <span className="text-sm">
            Saved {autoSaveStatus.lastSaved && new Date(autoSaveStatus.lastSaved).toLocaleTimeString()}
          </span>
        </div>
      );
    }

    if (autoSaveStatus.status === 'error') {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Failed to save</span>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading blog post editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header/toolbar */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {resolvedParams.action === 'edit' ? 'Edit Post' : 'Create New Post'}
                </h1>
                {post.status === 'published' ? (
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Draft
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AutoSaveIndicator />
              <div className="hidden sm:flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="gap-1"
                >
                  {saving && post.status === 'draft' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Draft
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                >
                  {saving && post.status === 'published' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
              {/* Mobile save button */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-1">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSave('draft')} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save as Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSave('published')} className="gap-2">
                      <Send className="h-4 w-4" />
                      Publish Now
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Menu className="h-4 w-4" />
                    <span className="hidden sm:inline">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push(`/blog/${post.slug}`)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Live Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const newPost = {...post, slug: `${post.slug}-copy`, title: `${post.title} (Copy)`};
                    // Logic to duplicate post
                  }} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Duplicate Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive gap-2"
                    onClick={() => {
                      if(confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                        // Logic to delete post
                        router.push('/admin');
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Post saved successfully!
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area - 3/4 width on large screens */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title Input - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg flex items-center gap-2">
                Title
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Post Title Best Practices</h4>
                      <p className="text-sm">Keep titles under 60 characters for better SEO. Include keywords near the beginning.</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </Label>
              <Input
                id="title"
                value={post.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter a compelling title for your post"
                className="text-lg py-6 text-2xl font-medium"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{post.title.length} characters</span>
                <span className={post.title.length > 60 ? "text-amber-500" : "text-green-500"}>
                  {post.title.length > 60 ? "Consider a shorter title for better SEO" : "Good title length"}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label className="text-lg flex items-center gap-2">
                Featured Image
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Featured Image Tips</h4>
                      <p className="text-sm">Use high-quality images with 16:9 aspect ratio (1920x1080px) for best results across all devices.</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </Label>
              {post.coverImage ? (
                <div className="relative w-full h-[300px] rounded-lg overflow-hidden border bg-muted/20 group">
                  <Image 
                    src={post.coverImage}
                    alt={post.title || "Featured image"}
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          // Open file picker
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            
                            try {
                              const path = generateStoragePath('blog-images', file.name);
                              const imageUrl = await uploadImage(file, path);
                              setPost(prev => ({
                                ...prev,
                                coverImage: imageUrl,
                                seo: {
                                  ...prev.seo,
                                  ogImage: imageUrl
                                }
                              }));
                              toast.success('Featured image updated');
                            } catch (error) {
                              console.error('Error uploading image:', error);
                              toast.error('Failed to upload image');
                            }
                          };
                          input.click();
                        }}
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setPost(prev => ({
                            ...prev,
                            coverImage: '',
                            seo: {
                              ...prev.seo,
                              ogImage: prev.seo.ogImage === prev.coverImage ? '' : prev.seo.ogImage
                            }
                          }));
                          toast.success('Featured image removed');
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[200px] bg-muted rounded-lg flex flex-col items-center justify-center border border-dashed gap-4 hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => {
                    // Open file picker
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      
                      try {
                        const path = generateStoragePath('blog-images', file.name);
                        const imageUrl = await uploadImage(file, path);
                        setPost(prev => ({
                          ...prev,
                          coverImage: imageUrl,
                          seo: {
                            ...prev.seo,
                            ogImage: imageUrl
                          }
                        }));
                        toast.success('Featured image added');
                      } catch (error) {
                        console.error('Error uploading image:', error);
                        toast.error('Failed to upload image');
                      }
                    };
                    input.click();
                  }}
                >
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  <Button
                    variant="secondary"
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Featured Image
                  </Button>
                  <p className="text-xs text-muted-foreground px-4 text-center">
                    Drag and drop an image here or click to browse
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground flex items-center">
                <InfoIcon className="h-3 w-3 mr-1 inline" />
                Featured images should be high quality with a 16:9 aspect ratio (1920x1080px recommended)
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-lg flex items-center gap-2">
                Excerpt
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Excerpt Tips</h4>
                      <p className="text-sm">A good excerpt summarizes your post in 1-2 sentences and appears in search results and social shares.</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </Label>
              <Textarea
                id="excerpt"
                value={post.excerpt}
                onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Enter a brief summary of your post (appears in search results and social shares)"
                rows={3}
                className="resize-y"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{post.excerpt.length} characters</span>
                <span className={cn(
                  post.excerpt.length > 160 ? "text-amber-500" : 
                  post.excerpt.length < 50 && post.excerpt.length > 0 ? "text-amber-500" : 
                  post.excerpt.length === 0 ? "text-muted-foreground" : "text-green-500"
                )}>
                  {post.excerpt.length > 160 ? "Too long for search results" : 
                   post.excerpt.length < 50 && post.excerpt.length > 0 ? "Consider a longer excerpt" : 
                   post.excerpt.length === 0 ? "Recommended: 50-160 characters" : "Good excerpt length"}
                </span>
              </div>
            </div>

            {/* Editor with reading time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Content</Label>
                <ReadingTime 
                  content={post.content} 
                  onTimeCalculated={(time) => {
                    if (time !== post.readingTime) {
                      setPost(prev => ({ ...prev, readingTime: time }));
                    }
                  }}
                />
              </div>
              <div className="border rounded-lg shadow-sm">
                <Editor
                  value={post.content}
                  onChange={(content: string) => setPost(prev => ({ ...prev, content }))}
                  coverImage={post.coverImage ? {
                    url: post.coverImage,
                    alt: post.title,
                    title: post.title,
                    description: post.excerpt,
                    width: 1920,
                    height: 1080,
                    loading: 'eager'
                  } : null}
                  onCoverImageChange={(imageData: ImageData | null) => {
                    setPost(prev => ({
                      ...prev,
                      coverImage: imageData?.url || '',
                      seo: {
                        ...prev.seo,
                        ogImage: imageData?.url || prev.seo.ogImage || ''
                      }
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - 1/4 width on large screens */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Publishing Options Card */}
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" />
                    Publishing
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={post.status}
                      onValueChange={(value: 'draft' | 'published') => 
                        setPost(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={post.author.name}
                      onChange={(e) => setPost(prev => ({
                        ...prev,
                        author: { ...prev.author, name: e.target.value }
                      }))}
                      placeholder="Author name"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => handleSave(post.status)}
                      disabled={saving}
                      className="w-full gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* URL Settings Card */}
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4 text-primary" />
                    URL Settings
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      URL Slug
                      <span className="text-xs text-muted-foreground ml-2">
                        (automatically generated from title)
                      </span>
                    </Label>
                    <div className="flex gap-2 items-center">
                      <span className="text-muted-foreground whitespace-nowrap text-xs">{BASE_URL}</span>
                      <Input
                        id="slug"
                        value={post.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="custom-url-slug"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="permalink" className="flex items-center">
                      Custom Permalink
                      <span className="text-xs text-muted-foreground ml-2">
                        (full URL, leave empty to use default)
                      </span>
                    </Label>
                    <Input
                      id="permalink"
                      value={post.permalink}
                      onChange={(e) => handlePermalinkChange(e.target.value)}
                      placeholder="https://..."
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  {post.isCustomPermalink && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSlug = slugify(post.title);
                          setPost(prev => ({
                            ...prev,
                            slug: newSlug,
                            permalink: `${BASE_URL}${newSlug}`,
                            isCustomPermalink: false
                          }));
                        }}
                      >
                        Reset to Default URL
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories and Tags Card */}
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Categories & Tags
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categories">Category</Label>
                    <Select 
                      value={post.categories?.[0] || ''}
                      onValueChange={(value) => {
                        try {
                          setPost(prev => ({ 
                            ...prev, 
                            categories: value ? [value] : [] 
                          }));
                          // Don't auto-save here, let the user explicitly save changes
                          toast.success(`Category updated to: ${value || 'None'}`);
                        } catch (error) {
                          console.error('Error updating category:', error);
                          toast.error('Failed to update category. Please try saving the post.');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input 
                      placeholder="Enter tags separated by commas"
                      value={post.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(Boolean);
                        setPost(prev => ({ ...prev, tags }));
                      }}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Settings Card */}
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    SEO Settings
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={post.seo.metaTitle}
                      onChange={(e) => setPost(prev => ({
                        ...prev,
                        seo: { ...prev.seo, metaTitle: e.target.value }
                      }))}
                      placeholder="Enter meta title"
                    />
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">
                        {post.seo.metaTitle.length} characters
                      </p>
                      <p className={cn(
                        "text-xs",
                        post.seo.metaTitle.length > 60 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        Recommended: max 60 characters
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={post.seo.metaDescription}
                      onChange={(e) => setPost(prev => ({
                        ...prev,
                        seo: { ...prev.seo, metaDescription: e.target.value }
                      }))}
                      placeholder="Enter meta description"
                      rows={3}
                    />
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">
                        {post.seo.metaDescription.length} characters
                      </p>
                      <p className={cn(
                        "text-xs",
                        post.seo.metaDescription.length > 160 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        Recommended: max 160 characters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="noIndex"
                      checked={post.seo.noIndex}
                      onChange={(e) => setPost(prev => ({
                        ...prev,
                        seo: { ...prev.seo, noIndex: e.target.checked }
                      }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="noIndex" className="text-sm font-normal">
                      Hide from search engines
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Keyboard shortcuts handler */}
      <div className="hidden">
        <KeyboardShortcuts
          shortcuts={[
            {
              key: 'ctrl+s',
              handler: (e) => {
                e.preventDefault();
                handleSave('draft');
              },
            },
            {
              key: 'ctrl+p',
              handler: (e) => {
                e.preventDefault();
                handleSave('published');
              },
            },
          ]}
        />
      </div>
    </div>
  );
} 