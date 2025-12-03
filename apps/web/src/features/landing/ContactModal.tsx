import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { ContactForm } from './ContactForm';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'early-access' | 'founders';
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, type }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const title = type === 'early-access' ? 'Join Early Access' : 'Talk to the Founders';

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Received!</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {type === 'early-access' 
              ? "You're on the list. We'll reach out to you shortly."
              : "Thanks for reaching out. We read every message and will get back to you."}
          </p>
          <Button onClick={handleClose} className="mt-6 w-full">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <ContactForm type={type} onSuccess={() => setIsSuccess(true)} />
    </Modal>
  );
};
