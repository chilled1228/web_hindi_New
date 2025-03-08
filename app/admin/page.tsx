'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, Timestamp, query, where, orderBy, limit } from 'firebase/firestore';
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
import { Loader2, Plus, Users, FileText, Pencil, Copy, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

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
      const metadataDoc = await getDoc(doc(db, 'settings', 'metadata'));
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
      
      const metadataDoc = doc(db, 'settings', 'metadata');
      await setDoc(metadataDoc, metadata);
      toast({
        title: 'Settings updated',
        description: 'Website metadata has been updated.',
      });
    } catch (error) {
      console.error('Error updating metadata:', error);
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
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
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users across your platform</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogPosts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {blogPosts.filter(post => post.status === 'published').length} published, 
              {blogPosts.filter(post => post.status === 'draft').length} drafts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Blog Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Blog Posts</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBlogPosts()}
            className="gap-2"
          >
            <Loader2 className={cn("h-4 w-4", updateLoading ? "animate-spin" : "")} />
            Refresh
          </Button>
        </div>
        
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-[200px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogPosts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        post.status === 'published' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                                               "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      )}>
                        {post.status}
                      </span>
                    </TableCell>
                    <TableCell>{post.author.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatPublishedDate(post.publishedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                          className="h-8 gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicatePost(post.id)}
                          className="h-8 gap-1"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Duplicate</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-8 gap-1"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Delete</span>
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
      </div>

      {/* Users Section */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Users</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin/users')}
          >
            View All Users
          </Button>
        </div>
        
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <span className="text-green-600 dark:text-green-400">Admin</span>
                      ) : (
                        <span className="text-muted-foreground">User</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          defaultValue={user.credits}
                          id={`credits-${user.id}`}
                          className="w-20 h-8"
                          onBlur={(e) => handleCreditUpdate(user.id, e.target)}
                        />
                        {updateLoading === user.id && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Website Metadata Section */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Website Metadata</h2>
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Website Title</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    placeholder="Enter website title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Website Description</Label>
                  <Textarea
                    id="description"
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    placeholder="Enter website description"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Website Keywords</Label>
                  <Input
                    id="keywords"
                    value={metadata.keywords}
                    onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={updateMetadata}
                  disabled={isMetadataLoading}
                >
                  {isMetadataLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Metadata'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 