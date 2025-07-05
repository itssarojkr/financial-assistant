import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserDataService, SavedData, TaxCalculationData } from '@/services/userDataService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Star, 
  StarOff, 
  Trash2, 
  Download, 
  Upload, 
  Calculator,
  Settings,
  Loader2,
  FileText,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface UserDashboardProps {
  onClose?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [savedCalculations, setSavedCalculations] = useState<SavedData[]>([]);
  const [favorites, setFavorites] = useState<SavedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('calculations');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [calculationsResult, favoritesResult] = await Promise.all([
        UserDataService.getTaxCalculations(user.id),
        UserDataService.getFavorites(user.id)
      ]);

      if (calculationsResult.error) {
        setError('Failed to load saved calculations');
      } else {
        setSavedCalculations(calculationsResult.data || []);
      }

      if (favoritesResult.error) {
        setError('Failed to load favorites');
      } else {
        setFavorites(favoritesResult.data || []);
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (dataId: string, isFavorite: boolean) => {
    if (!user) return;

    try {
      const { error } = await UserDataService.updateFavoriteStatus(dataId, !isFavorite);
      
      if (error) {
        setError('Failed to update favorite status');
      } else {
        // Reload data to reflect changes
        await loadUserData();
      }
    } catch (err) {
      setError('Failed to update favorite status');
    }
  };

  const handleDeleteCalculation = async (dataId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this calculation?')) {
      return;
    }

    try {
      const { error } = await UserDataService.deleteSavedData(dataId);
      
      if (error) {
        setError('Failed to delete calculation');
      } else {
        // Reload data to reflect changes
        await loadUserData();
      }
    } catch (err) {
      setError('Failed to delete calculation');
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const { data, error } = await UserDataService.exportUserData(user.id);
      
      if (error) {
        setError('Failed to export data');
        return;
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-assistant-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;

    const file = event.target.files[0];
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      const { error } = await UserDataService.importUserData(user.id, importData);
      
      if (error) {
        setError('Failed to import data: ' + error.message);
      } else {
        // Reload data to reflect changes
        await loadUserData();
        alert('Data imported successfully!');
      }
    } catch (err) {
      setError('Failed to import data: Invalid file format');
    }
  };

  const filteredCalculations = savedCalculations.filter(item =>
    item.data_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCalculationCard = (item: SavedData) => {
    const data = item.data_content as TaxCalculationData;
    
    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{item.data_name}</CardTitle>
              <CardDescription>
                {new Date(item.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleFavorite(item.id, item.is_favorite)}
              >
                {item.is_favorite ? (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCalculation(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Country</Label>
              <p className="font-medium">{data.country}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Salary</Label>
              <p className="font-medium">{formatCurrency(data.salary, data.currency)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tax Amount</Label>
              <p className="font-medium text-red-600">{formatCurrency(data.taxAmount, data.currency)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Net Salary</Label>
              <p className="font-medium text-green-600">{formatCurrency(data.netSalary, data.currency)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {data.effectiveTaxRate.toFixed(1)}% effective rate
            </Badge>
            {data.notes && (
              <p className="text-sm text-muted-foreground truncate max-w-32">
                {data.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Dashboard</h2>
          <p className="text-muted-foreground">Manage your saved calculations and preferences</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculations" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calculations</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Favorites</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculations" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calculations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleExportData} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {filteredCalculations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchQuery ? 'No calculations found matching your search.' : 'No saved calculations yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCalculations.map(renderCalculationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No favorite calculations yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {favorites.map(renderCalculationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Import or export your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={handleExportData} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data
                </Button>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <Label htmlFor="import-file">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Data
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Export your data as a JSON file or import previously exported data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {savedCalculations.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Calculations</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {favorites.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 