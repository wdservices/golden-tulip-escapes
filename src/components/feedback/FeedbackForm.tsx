import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FeedbackFormProps {
  className?: string;
  userId?: string;
  userEmail?: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ className = '', userId, userEmail, onSuccess }: FeedbackFormProps) {
  const [type, setType] = useState<'suggestion' | 'complaint' | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'feedback'), {
        type,
        message: message.trim(),
        userId: userId || 'anonymous',
        userEmail: userEmail || 'anonymous@example.com',
        status: 'new',
        createdAt: serverTimestamp(),
      });
      
      toast.success('Thank you for your feedback!');
      setMessage('');
      setType('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Share Your Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback-type">Type</Label>
          <Select 
            value={type} 
            onValueChange={(value: 'suggestion' | 'complaint' | '') => setType(value)}
            required
          >
            <SelectTrigger id="feedback-type">
              <SelectValue placeholder="Select feedback type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback-message">
            {type === 'suggestion' ? 'Your Suggestion' : 
             type === 'complaint' ? 'Your Complaint' : 'Your Message'}
          </Label>
          <Textarea
            id="feedback-message"
            placeholder={`Enter your ${type || 'message'} here...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </div>
  );
}
