
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AddMemberDialogProps {
  onAddMember: (member: {
    name: string;
    email: string;
    role: 'admin' | 'user';
  }) => void;
}

const AddMemberDialog = ({ onAddMember }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      // Create the account in Supabase Auth
      const { error } = await signUp(email.trim(), 'TempPassword123!', name.trim(), role);
      
      if (error) {
        toast.error(`Failed to create account: ${error.message}`);
        setLoading(false);
        return;
      }

      // Add to team members via the parent component
      onAddMember({ 
        name: name.trim(), 
        email: email.trim(), 
        role 
      });
      
      // Reset form
      setName('');
      setEmail('');
      setRole('user');
      setOpen(false);
      
      toast.success(`${role === 'admin' ? 'Admin' : 'User'} member added successfully! They will receive an email to confirm their account.`);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Access Level</Label>
            <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User Access</SelectItem>
                <SelectItem value="admin">Admin Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
