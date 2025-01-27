'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Eye, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
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

const BASE_URL = 'https://freepromptbase.com/blog/';

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
    if (!user || !isAdmin || resolvedParams.action !== 'edit') return;

    try {
      setAutoSaveStatus({ status: 'saving', lastSaved: new Date() });
      
      const docRef = doc(db, 'blog_posts', resolvedParams.id);
      await updateDoc(docRef, {
        ...debouncedPost,
        updatedAt: Timestamp.now(),
        status: 'draft'
      });

      setAutoSaveStatus({ status: 'saved', lastSaved: new Date() });
      toast.success('Draft saved automatically');
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to auto-save',
        lastSaved: autoSaveStatus.lastSaved 
      });
      toast.error('Failed to auto-save draft');
    }
  }, [debouncedPost, user, isAdmin, resolvedParams.action, resolvedParams.id, autoSaveStatus.lastSaved]);

  // Effect for auto-save
  useEffect(() => {
    autoSave();
  }, [debouncedPost, autoSave]);

  useEffect(() => {
    if (!user) {
      router.push('/auth?redirect=/admin/blog/' + resolvedParams.action + '/' + resolvedParams.id);
      return;
    }

    async function checkAdminAndFetchPost() {
      setLoading(true);
      try {
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
  }, [user, resolvedParams.action, resolvedParams.id, router]);

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
    if (!user || !isAdmin) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
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
        }
      };

      if (status === 'published' && !post.publishedAt) {
        postData.publishedAt = Timestamp.now();
      }

      if (resolvedParams.action === 'edit' && resolvedParams.id) {
        const docRef = doc(db, 'blog_posts', resolvedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          await updateDoc(docRef, postData);
        } else {
          await setDoc(docRef, postData);
        }
      } else {
        const newDocRef = doc(collection(db, 'blog_posts'));
        await setDoc(newDocRef, postData);
      }
      
      setPost(prev => ({
        ...prev,
        ...postData
      }));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving post:', error);
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
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/5">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">
                {resolvedParams.action === 'edit' ? 'Edit Post' : 'Create New Post'}
              </h1>
              <AutoSaveIndicator />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </Button>
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

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="edit">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={post.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter post title"
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      URL Slug
                      <span className="text-xs text-muted-foreground ml-2">
                        (automatically generated from title)
                      </span>
                    </Label>
                    <div className="flex gap-2 items-center">
                      <span className="text-muted-foreground whitespace-nowrap">{BASE_URL}</span>
                      <Input
                        id="slug"
                        value={post.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="custom-url-slug"
                        className="font-mono text-sm"
                      />
                    </div>

                    <Label htmlFor="permalink" className="mt-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={post.excerpt}
                      onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Enter post excerpt"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Content</Label>
                      <ReadingTime 
                        content={post.content} 
                        onTimeCalculated={(time) => {
                          if (time !== post.readingTime) {
                            setPost(prev => ({ ...prev, readingTime: time }));
                          }
                        }}
                      />
                    </div>
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

              <div className="lg:col-span-1 space-y-8">
                <div className="space-y-4">
                  <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                    <div className="space-y-4">
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
                        <p className="text-xs text-muted-foreground">
                          {post.seo.metaTitle.length}/60 characters
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                          {post.seo.metaDescription.length}/160 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metaKeywords">Meta Keywords</Label>
                        <Input
                          id="metaKeywords"
                          value={post.seo.metaKeywords}
                          onChange={(e) => setPost(prev => ({
                            ...prev,
                            seo: { ...prev.seo, metaKeywords: e.target.value }
                          }))}
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="canonicalUrl">Canonical URL (optional)</Label>
                        <Input
                          id="canonicalUrl"
                          value={post.seo.canonicalUrl || ''}
                          onChange={(e) => setPost(prev => ({
                            ...prev,
                            seo: { ...prev.seo, canonicalUrl: e.target.value }
                          }))}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ogImage">Social Image URL (optional)</Label>
                        <Input
                          id="ogImage"
                          value={post.seo.ogImage || ''}
                          onChange={(e) => setPost(prev => ({
                            ...prev,
                            seo: { ...prev.seo, ogImage: e.target.value }
                          }))}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="noIndex"
                          checked={post.seo.noIndex}
                          onChange={(e) => setPost(prev => ({
                            ...prev,
                            seo: { ...prev.seo, noIndex: e.target.checked }
                          }))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="noIndex">No Index (hide from search engines)</Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-lg font-semibold mb-4">Categories & Tags</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="categories">Categories</Label>
                        <Input
                          id="categories"
                          value={post.categories?.join(', ') || ''}
                          onChange={(e) => setPost(prev => ({
                            ...prev,
                            categories: e.target.value ? e.target.value.split(',').map(cat => cat.trim()) : []
                          }))}
                          placeholder="Category1, Category2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={post.tags?.join(', ') || ''}
                          onChange={(e) => setPost(prev => ({
                            ...prev,
                            tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()) : []
                          }))}
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Preview content={post.content} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 