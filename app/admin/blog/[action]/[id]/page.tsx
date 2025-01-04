'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Eye, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/app/providers';
import { slugify } from '@/lib/utils';
import { ImageUpload } from '@/components/blog/image-upload';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
}) as any;

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: 'draft' | 'published';
  publishedAt: Timestamp | null;
  author: {
    name: string;
    avatar: string;
  };
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

export default function BlogPostEditor({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params) as PageParams;
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'draft',
    publishedAt: null,
    author: {
      name: '',
      avatar: ''
    }
  });

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

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!user || !isAdmin) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      const postData = {
        ...post,
        status,
        slug: slugify(post.title),
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
        await updateDoc(doc(db, 'blog_posts', resolvedParams.id), postData);
      } else {
        const newDocRef = doc(collection(db, 'blog_posts'));
        await setDoc(newDocRef, postData);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
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
                      onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter post title"
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={post.excerpt}
                      onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Enter a brief excerpt of your post"
                      className="h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <div className="min-h-[500px] bg-background rounded-lg overflow-hidden">
                    <Editor
                      value={post.content}
                      onChange={(content: string) => setPost(prev => ({ ...prev, content }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4 rounded-lg border bg-card p-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
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
                    <Label>Cover Image</Label>
                    <ImageUpload
                      onImageUploaded={(url) => setPost(prev => ({ ...prev, coverImage: url }))}
                      className="mb-2"
                    />
                    {post.coverImage && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt="Cover image preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="relative">
            <div className="prose prose-lg max-w-4xl mx-auto">
              <h1>{post.title}</h1>
              {post.coverImage && (
                <div className="relative aspect-[2/1] rounded-lg overflow-hidden my-8">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 