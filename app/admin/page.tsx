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
import { Loader2, Plus, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
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
      await setDoc(doc(db, 'settings', 'metadata'), metadata);
      setIsMetadataLoading(false);
    } catch (error) {
      console.error('Error updating metadata:', error);
      setIsMetadataLoading(false);
    }
  };

  const updateUserCredits = async (userId: string, newCredits: number) => {
    try {
      setUpdateLoading(userId);
      
      // Update in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        credits: newCredits
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, credits: newCredits } 
            : user
        )
      );
      
      setUpdateLoading(null);
    } catch (error) {
      console.error('Error updating user credits:', error);
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
      const postsQuery = query(
        collection(db, 'blog_posts'),
        orderBy('publishedAt', 'desc'),
        limit(10)
      );
      const postsSnapshot = await getDocs(postsQuery);
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
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'blog_posts', postId));
        setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleDuplicatePost = async (postId: string) => {
    try {
      const postDoc = await getDoc(doc(db, 'blog_posts', postId));
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const newPostRef = doc(collection(db, 'blog_posts'));
        
        await setDoc(newPostRef, {
          ...postData,
          title: `${postData.title} (Copy)`,
          status: 'draft',
          publishedAt: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        // Refresh posts
        fetchBlogPosts();
      }
    } catch (error) {
      console.error('Error duplicating post:', error);
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
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Blog Posts</h2>
          <Button
            onClick={() => router.push('/admin/blog/new')}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      post.status === 'published' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell>{post.author.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatPublishedDate(post.publishedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicatePost(post.id)}
                      >
                        Duplicate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {blogPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No blog posts yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Website Settings</h2>
        </div>
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Website Title</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={metadata.keywords}
                onChange={(e) => setMetadata(prev => ({ ...prev, keywords: e.target.value }))}
                className="mt-1"
              />
            </div>
            <Button
              onClick={updateMetadata}
              disabled={isMetadataLoading}
              size="sm"
            >
              {isMetadataLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Update Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 