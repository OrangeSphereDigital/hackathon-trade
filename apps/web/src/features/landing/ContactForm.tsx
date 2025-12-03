import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { client } from '@/lib/client';

interface ContactFormProps {
  type: 'early-access' | 'founders';
  onSuccess?: () => void;
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ type, onSuccess, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = type === 'early-access'
        ? await client.contact['early-access'].post(formData)
        : await client.contact.founders.post(formData);

      if (error) {
        throw new Error(error.value?.message || 'Something went wrong');
      }

      toast.success(type === 'early-access' 
        ? 'Early access request submitted!' 
        : 'Message sent to founders!');
      
      setFormData({ name: '', email: '', phone: '', message: '' });
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          required
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          value={formData.phone}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <textarea
          id="message"
          name="message"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={type === 'early-access' ? "Tell us about your trading volume..." : "What's on your mind?"}
          value={formData.message}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : (type === 'early-access' ? 'Join Waitlist' : 'Send Message')}
      </Button>
    </form>
  );
};
