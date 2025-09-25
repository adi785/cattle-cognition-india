import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Shield, Camera, Database, TrendingUp, Users, CircleDot } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <Shield className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-primary">Krishimitr-AI</span>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <CircleDot className="h-16 w-16 text-primary" />
            <Shield className="h-12 w-12 text-accent" />
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6">
            AI-Powered Cattle Breed Recognition
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Instantly identify cattle and buffalo breeds using advanced AI technology. 
            Perfect for farmers, veterinarians, and livestock professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              <Camera className="h-5 w-5 mr-2" />
              Start Classifying
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for cattle & bread Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Camera className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI Classification</CardTitle>
                <CardDescription>
                  Upload photos and get instant breed identification with confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Support for cattle and buffalo</li>
                  <li>• High accuracy AI models</li>
                  <li>• Instant results</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Record Management</CardTitle>
                <CardDescription>
                  Keep track of all your classifications and manage animal records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Secure cloud storage</li>
                  <li>• Search and filter records</li>
                  <li>• Export capabilities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Get detailed insights and statistics about your livestock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Classification trends</li>
                  <li>• Confidence metrics</li>
                  <li>• Performance analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-primary/20">
            <CardContent className="p-12">
              <Users className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Join the Krishimitr AI Revolution
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Thousands of farmers and veterinarians trust Krishimitr-AI for accurate 
                breed identification. Start your journey today.
              </p>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary" />
            <Shield className="h-4 w-4 text-accent" />
            <span className="font-semibold">Krishimitr-AI</span>
          </div>
          <p className="text-sm">
            © 2025 Krishimitr-AI. Powered by advanced AI technology for livestock identification.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
