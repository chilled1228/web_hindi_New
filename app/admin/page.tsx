'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, Timestamp, query, where, orderBy, limit, Firestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Users, FileText, Pencil, Copy, Trash2, RefreshCw, LayoutDashboard, ChevronRight, Settings, BarChart3, Calendar, Clock, ArrowUpRight, AlertCircle, CheckCircle2, Filter, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { revalidateEntireSite, revalidateAllBlogPosts, revalidateBlogPost } from '@/lib/revalidation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';

interface User {
  id: string;
  email: string;
  credits: number;
  isAdmin: boolean;
  createdAt: string;
}

interface WebsiteMetadata {
  title: string;
  description: string;
  keywords: string;
}

interface BlogPost {
  id: string;
  title: string;
  status: string;
  author: {
    name: string;
  };
  publishedAt: {
    toDate?: () => Date;
    seconds?: number;
    nanoseconds?: number;
  } | string | null;
}

interface DashboardStats {
  totalUsers: number;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<WebsiteMetadata>({
    title: '',
    description: '',
    keywords: ''
  });
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0
  });
  const [token, setToken] = useState<string>('');

  const fetchStats = async () => {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      // Fetch total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      setStats({
        totalUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users.');
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists() || !userDocSnap.data()?.isAdmin) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setIsAdmin(true);
        
        // Fetch data
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchMetadata(),
          fetchBlogPosts()
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Failed to verify admin status');
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchMetadata = async () => {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      // Use type assertion to ensure db is treated as Firestore
      const firestoreDb = db as Firestore;
      const metadataDoc = await getDoc(doc(firestoreDb, 'metadata', 'website'));
      if (metadataDoc.exists()) {
        setMetadata(metadataDoc.data() as WebsiteMetadata);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const updateMetadata = async () => {
    try {
      setIsMetadataLoading(true);
      
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      // Use type assertion to ensure db is treated as Firestore
      const firestoreDb = db as Firestore;
      const metadataDoc = doc(firestoreDb, 'metadata', 'website');
      await setDoc(metadataDoc, metadata);
      toast({
        title: 'Settings updated',
        description: 'Website metadata has been updated.',
      });
      
      // Trigger revalidation to update the site
      try {
        const success = await revalidateEntireSite();
        if (success) {
          toast({
            title: 'Site refreshed',
            description: 'Changes are now live on the site.',
          });
        }
      } catch (revalidateError) {
        console.error('Error revalidating site:', revalidateError);
      }
    } catch (error) {
      console.error('Error updating metadata:', error);
      toast({
        title: 'Error',
        description: 'Failed to save metadata. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMetadataLoading(false);
    }
  };

  const updateUserCredits = async (userId: string, newCredits: number) => {
    try {
      setUpdateLoading(userId);
      
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        credits: newCredits
      });
      
      toast({
        title: 'Credits updated',
        description: `User credits updated to ${newCredits}.`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: 'Error',
        description: 'Failed to update credits.',
        variant: 'destructive',
      });
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleCreditUpdate = (userId: string, input: HTMLInputElement) => {
    const newCredits = parseInt(input.value);
    if (!isNaN(newCredits)) {
      updateUserCredits(userId, newCredits);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      const postsSnapshot = await getDocs(collection(db, 'blog_posts'));
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setBlogPosts(postsData);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      await deleteDoc(doc(db, 'blog_posts', postId));
      fetchBlogPosts();
      toast({
        title: 'Post deleted',
        description: 'The blog post has been permanently deleted.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDuplicatePost = async (postId: string) => {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return;
      }
      
      const postDoc = doc(db, 'blog_posts', postId);
      const postSnap = await getDoc(postDoc);
      
      if (postSnap.exists()) {
        const postData = postSnap.data();
        // Create a new document reference
        const newPostDoc = doc(collection(db, 'blog_posts'));
        
        await setDoc(newPostDoc, {
          ...postData,
          title: `${postData.title} (Copy)`,
          slug: `${postData.slug}-copy`,
          permalink: postData.permalink ? `${postData.permalink}-copy` : '',
          status: 'draft',
          createdAt: Timestamp.now(),
          publishedAt: null
        });
        
        fetchBlogPosts();
        toast({
          title: 'Post duplicated',
          description: 'A copy of the post has been created as a draft.',
        });
      }
    } catch (error) {
      console.error('Error duplicating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate post.',
        variant: 'destructive',
      });
    }
  };

  const formatPublishedDate = (publishedAt: any) => {
    if (!publishedAt) return 'Draft';
    
    try {
      if (publishedAt?.toDate) {
        return formatDistanceToNow(publishedAt.toDate(), { addSuffix: true });
      }
      
      if (typeof publishedAt === 'string') {
        return formatDistanceToNow(new Date(publishedAt), { addSuffix: true });
      }
      
      if (publishedAt.seconds) {
        return formatDistanceToNow(new Date(publishedAt.seconds * 1000), { addSuffix: true });
      }
      
      return 'Draft';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Draft';
    }
  };

  const handleRevalidatePost = async (post: BlogPost) => {
    if (post.status !== 'published') {
      toast({
        title: 'Info',
        description: 'Only published posts can be revalidated.',
        variant: 'default',
      });
      return;
    }
    
    toast({
      title: 'Revalidating...',
      description: `Refreshing "${post.title}" on the live site...`,
    });
    
    try {
      const success = await revalidateBlogPost(post.id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Post refreshed on the live site!',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to refresh post. Try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error revalidating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh post. Try again later.',
        variant: 'destructive',
      });
    }
  };

  if (typeof window === 'undefined') {
    return null;
  }

  if (authLoading || (!isAdmin && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You need to be an admin to access this page.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Minimal Navigation Bar */}
      <div className="bg-background sticky top-0 z-50 border-b shadow-sm py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <nav className="hidden md:flex items-center gap-4">
                <Link href="/admin" className="text-sm font-medium text-primary">Dashboard</Link>
                <Link href="/admin/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                <Link href="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Users</Link>
                <Link href="/admin/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  toast({
                    title: 'Revalidating...',
                    description: 'Refreshing site content...',
                  });
                  
                  const success = await revalidateEntireSite();
                  
                  if (success) {
                    toast({
                      title: 'Success',
                      description: 'Site content refreshed successfully!',
                      variant: 'default',
                    });
                  } else {
                    toast({
                      title: 'Error',
                      description: 'Failed to refresh site content. Try again later.',
                      variant: 'destructive',
                    });
                  }
                }}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh Site</span>
              </Button>
              <Button
                onClick={() => router.push('/admin/blog/new')}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Post</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (auth) {
                    signOut(auth);
                    router.push('/auth');
                  }
                }}
                className="gap-2 text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-xl p-6 shadow-sm border relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Admin</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">Manage your website content, users, and settings from this dashboard.</p>
          </div>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Content - 8 columns */}
          <div className="md:col-span-8 space-y-8">
            {/* Stats Overview Section */}
            <section aria-labelledby="stats-heading" className="bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 id="stats-heading" className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Dashboard Overview
                </h2>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last updated: {new Date().toLocaleTimeString()}
                </Badge>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow transition-all group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <div className="rounded-full p-1.5 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Users className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                      <span>Registered users across your platform</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow transition-all group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                    <div className="rounded-full p-1.5 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{blogPosts.length}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="success" className="text-[10px] h-5">
                        {blogPosts.filter(post => post.status === 'published').length} published
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {blogPosts.filter(post => post.status === 'draft').length} drafts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Blog Posts Section */}
            <section aria-labelledby="blog-posts-heading" className="bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 id="blog-posts-heading" className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Blog Posts
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin/blog')}
                    className="gap-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    View All
                  </Button>
                  <Button
                    onClick={() => router.push('/admin/blog/new')}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Post
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.slice(0, 5).map((post) => (
                        <TableRow key={post.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            {post.status === 'published' ? (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{post.author.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatPublishedDate(post.publishedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {blogPosts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileText className="h-8 w-8 text-muted-foreground/50" />
                              <p>No blog posts yet</p>
                              <Button variant="outline" size="sm" onClick={() => router.push('/admin/blog/new')} className="mt-2">
                                Create your first post
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>
          </div>
          
          {/* Sidebar - 4 columns */}
          <div className="md:col-span-4 space-y-8">
            {/* Users Section */}
            <section aria-labelledby="users-heading" className="bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 id="users-heading" className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent Users
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/admin/users')}
                  className="gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user.isAdmin ? (
                          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Admin</Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{user.credits} credits</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <p>No users yet</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
            
            {/* Website Metadata Section */}
            <section aria-labelledby="metadata-heading" className="bg-card rounded-xl border shadow-sm p-6">
              <h2 id="metadata-heading" className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Website Settings
              </h2>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Website Title</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    placeholder="Enter website title"
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Website Description</Label>
                  <Textarea
                    id="description"
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    placeholder="Enter website description"
                    rows={3}
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-sm font-medium">Website Keywords</Label>
                  <Input
                    id="keywords"
                    value={metadata.keywords}
                    onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                    className="bg-background"
                  />
                </div>
                
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={updateMetadata}
                    disabled={isMetadataLoading}
                    className="w-full gap-2"
                  >
                    {isMetadataLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Save & Refresh Site
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 