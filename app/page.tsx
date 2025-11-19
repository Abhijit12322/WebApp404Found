'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Binoculars,
  Zap,
  TrendingUp,
  ArrowRight,
  Play,
  Sparkles,
  Shield,
  Eye,
  Radar,
  Network,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const animalImages = [
    { url: 'https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg', name: 'Tiger' },
    { url: 'https://images.pexels.com/photos/66898/elephant-cub-tsavo-kenya-66898.jpeg', name: 'Elephant' },
    { url: 'https://images.pexels.com/photos/357159/pexels-photo-357159.jpeg', name: 'Owl' },
    { url: 'https://images.pexels.com/photos/1054713/pexels-photo-1054713.jpeg', name: 'Panda' },
    { url: 'https://images.pexels.com/photos/4577793/pexels-photo-4577793.jpeg', name: 'Elephant' },
    { url: 'https://images.pexels.com/photos/635499/pexels-photo-635499.jpeg', name: 'Horse' },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

        {/* Animated grid */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/5 to-transparent" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', transform: `translateY(${scrollY * 0.5}px)` }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/50 transition">
              <Binoculars className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold text-white">WildGuard AI</span>
          </div>
          <div className="flex gap-4">
            <Link href="#features">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition">
                Features
              </Button>
            </Link>
            <Link href="#about">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition">
                About
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/50 transition">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400/60 transition">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-300">AI-Powered Wildlife Protection</span>
                </div>
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-white">Monitor Wildlife</span>
                  <br />
                  <span className="bg-linear-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    In Real-Time
                  </span>
                </h1>
                <p className="text-xl text-slate-300 max-w-xl leading-relaxed">
                  Protect endangered species with advanced AI detection. Real-time monitoring for images, videos, and live streams powered by cutting-edge machine learning.
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                <Link href="/login">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition">
                    Start Detection
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-500 hover:bg-slate-800 hover:border-slate-500 transition">
                  Watch Demo
                  <Play className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="group p-4 bg-linear-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-lg hover:border-emerald-500/50 transition">
                  <div className="text-3xl font-bold text-emerald-400">70%</div>
                  <p className="text-sm text-slate-400 mt-2">Detection Accuracy</p>
                </div>
                <div className="group p-4 bg-linear-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition">
                  <div className="text-3xl font-bold text-cyan-400">24/7</div>
                  <p className="text-sm text-slate-400 mt-2">Monitoring Active</p>
                </div>
                <div className="group p-4 bg-linear-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition">
                  <div className="text-3xl font-bold text-blue-400">20+</div>
                  <p className="text-sm text-slate-400 mt-2">Species Tracked</p>
                </div>
              </div>
            </div>

            {/* Right Visual with Animal Images */}
            <div className="relative h-96 lg:h-full min-h-[500px]">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-2xl" />
              <div className="absolute inset-0 rounded-2xl border border-emerald-500/30 overflow-hidden">
                <div className="w-full h-full bg-linear-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center relative">
                  {/* Background animal image with overlay */}
                  <div className="absolute inset-0">
                    <img
                      src="https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg"
                      alt="Tiger in wildlife"
                      className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  </div>

                  <div className="relative w-48 h-48 z-10">
                    {/* Animated circles */}
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-pulse" />
                    <div className="absolute inset-8 rounded-full border-2 border-cyan-500/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute inset-16 rounded-full border-2 border-blue-500/40 animate-pulse" style={{ animationDelay: '1s' }} />

                    {/* Rotating radar lines */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                      <div className="absolute inset-0 border-l-2 border-emerald-500/30" />
                      <div className="absolute inset-0 border-r-2 border-emerald-500/20" />
                    </div>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-cyan-400 rounded-full blur animate-pulse" />
                        <div className="relative w-20 h-20 bg-linear-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/50 transition">
                          <Eye className="w-10 h-10 text-white" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>

                    {/* Floating animal thumbnails */}
                    {[
                      { angle: 0, img: 'https://images.pexels.com/photos/1054713/pexels-photo-1054713.jpeg', name: 'Panda' },
                      { angle: 120, img: 'https://images.pexels.com/photos/66898/elephant-cub-tsavo-kenya-66898.jpeg', name: 'Elephant' },
                      { angle: 240, img: 'https://images.pexels.com/photos/357159/pexels-photo-357159.jpeg', name: 'Lion' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="absolute w-12 h-12 rounded-full border-2 border-emerald-400 overflow-hidden animate-pulse shadow-lg shadow-emerald-500/30 hover:scale-110 transition-transform"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${item.angle}deg) translateY(-80px)`,
                          animationDelay: `${idx * 0.3}s`,
                        }}
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wildlife Gallery Section */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Species We Monitor</h2>
            <p className="text-slate-400">Advanced AI detection for endangered wildlife worldwide</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {animalImages.map((animal, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all hover:scale-105 cursor-pointer"
              >
                <img
                  src={animal.url}
                  alt={animal.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent opacity-60 group-hover:opacity-80 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm">{animal.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Monitored</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need for comprehensive wildlife monitoring and protection
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Feature 1 - Real-Time Detection */}
            <div
              className={`group p-8 rounded-xl border transition-all duration-500 ${activeFeature === 0
                ? 'border-emerald-500/50 bg-linear-to-br from-emerald-500/15 to-emerald-500/5 shadow-lg shadow-emerald-500/20'
                : 'border-slate-700 bg-linear-to-br from-slate-800/50 to-slate-900/50 hover:border-emerald-500/30'
                }`}
            >
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-600/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Detection</h3>
              <p className="text-slate-400">
                Instant AI analysis of images and video streams with lightning-fast processing and 98% accuracy
              </p>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm opacity-0 group-hover:opacity-100 transition">
                <CheckCircle2 className="w-4 h-4" />
                <span>Lightning fast</span>
              </div>
            </div>

            {/* Feature 2 - Analytics */}
            <div
              className={`group p-8 rounded-xl border transition-all duration-500 ${activeFeature === 1
                ? 'border-cyan-500/50 bg-linear-to-br from-cyan-500/15 to-cyan-500/5 shadow-lg shadow-cyan-500/20'
                : 'border-slate-700 bg-linear-to-br from-slate-800/50 to-slate-900/50 hover:border-cyan-500/30'
                }`}
            >
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-600/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-slate-400">
                Comprehensive insights and metrics for tracking wildlife populations and identifying trends
              </p>
              <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transition">
                <Activity className="w-4 h-4" />
                <span>Real-time stats</span>
              </div>
            </div>

            {/* Feature 3 - Security */}
            <div
              className={`group p-8 rounded-xl border transition-all duration-500 ${activeFeature === 2
                ? 'border-blue-500/50 bg-linear-to-br from-blue-500/15 to-blue-500/5 shadow-lg shadow-blue-500/20'
                : 'border-slate-700 bg-linear-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/30'
                }`}
            >
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
              <p className="text-slate-400">
                Enterprise-grade security with end-to-end encryption and compliance with all data protection standards
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition">
                <Lock className="w-4 h-4" />
                <span>Bank-level encryption</span>
              </div>
            </div>

            {/* Feature 4 — History Visualization */}
            <div
              className={`group p-8 rounded-2xl border transition-all duration-500 hover:scale-[1.02] ${activeFeature === 3
                ? "border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                : "border-slate-700 bg-slate-800/40 hover:border-purple-500/40"
                }`}
            >
              <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center mb-4 
      shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">History Data Visualization</h3>
              <p className="text-slate-400">
                Interactive charts and long-term visual insights for species patterns.
              </p>

              <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm opacity-0 group-hover:opacity-100 transition-all">
                <TrendingUp className="w-4 h-4" />
                <span>Interactive charts</span>
              </div>
            </div>

          </div>
        </section>

        {/* Advanced Capabilities Section */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Text */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white">Advanced Capabilities</h2>
              <p className="text-slate-300 text-lg">
                Our AI system combines multiple detection methods to provide unmatched accuracy and reliability in wildlife monitoring.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Radar, title: 'Multi-Spectral Detection', desc: 'Detect wildlife across multiple light spectrums' },
                  { icon: Network, title: 'Distributed Processing', desc: 'Process data across multiple servers for speed' },
                  { icon: Clock, title: 'Historical Analysis', desc: 'Track patterns and behaviors over time' },
                  { icon: AlertCircle, title: 'Smart Alerts', desc: 'Intelligent threat assessment and notifications' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition group">
                    <item.icon className="w-6 h-6 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Visual with animal */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-2xl" />
              <div className="relative rounded-2xl border border-slate-700 bg-slate-900/50 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/4577793/pexels-photo-4577793.jpeg"
                  alt="Gorilla"
                  className="w-full h-64 object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/70 to-transparent" />
                <div className="relative p-8 space-y-4">
                  {[
                    { label: 'Detection Speed', value: '< 100ms', percent: 95, color: 'emerald' },
                    { label: 'Accuracy Rate', value: '98.2%', percent: 98, color: 'cyan' },
                    { label: 'Species Database', value: '50+ Species', percent: 90, color: 'blue' },
                    { label: 'Uptime', value: '99.9%', percent: 99, color: 'emerald' },
                  ].map((stat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300 text-sm">{stat.label}</span>
                        <span className="text-emerald-400 font-semibold">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-1000"
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* About Section */}
        <section id="about" className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About WildGuard AI
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              WildGuard AI is dedicated to protecting wildlife through cutting-edge AI technology. We provide real-time monitoring, analytics, and actionable insights to conserve endangered species and preserve ecosystems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl border border-slate-700 bg-slate-900/50">
              <Zap className="w-10 h-10 mx-auto mb-4 text-emerald-400" />
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Detection</h3>
              <p className="text-slate-400">
                Leveraging AI to identify and monitor wildlife in real-time.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-700 bg-slate-900/50">
              <TrendingUp className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-xl font-bold text-white mb-2">Data Analytics</h3>
              <p className="text-slate-400">
                Gain actionable insights with detailed analytics for conservation efforts.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-700 bg-slate-900/50">
              <Shield className="w-10 h-10 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
              <p className="text-slate-400">
                Enterprise-grade security ensures the protection of wildlife data.
              </p>
            </div>
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Conservationists</h2>
            <p className="text-slate-400">Join organizations protecting endangered species worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Sarah Chen', role: 'Wildlife Biologist', text: 'Revolutionary approach to wildlife monitoring' },
              { name: 'James Wildlife Reserve', role: 'Conservation Director', text: 'Dramatically improved our protection efforts' },
              { name: 'Emma Conservation', role: 'Research Lead', text: 'The accuracy is absolutely incredible' },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-700 bg-linear-to-br from-slate-800/50 to-slate-900/50 hover:border-emerald-500/30 transition hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-emerald-400">★</span>
                  ))}
                </div>
                <p className="text-slate-300 mb-4">{testimonial.text}</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 p-12 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-cyan-500/5" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to protect wildlife?
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join conservation efforts worldwide. Start monitoring with AI today and make a real difference in wildlife protection.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/login">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg shadow-emerald-600/30">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-slate-800">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">About</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Follow</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex items-center justify-between flex-wrap gap-4">
            <p className="text-slate-500 text-sm">
              2025 WildGuard AI. Protecting wildlife through technology.
            </p>
            <div className="flex gap-6 text-sm">
              <p className="text-slate-500">Made for Earth</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
