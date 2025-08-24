"use client";

import React from 'react';
import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

// ... rest of the component as you have it, with images using loading="lazy"