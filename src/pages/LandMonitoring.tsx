import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Weight,
  Leaf,
  Calendar,
  Sun,
} from "lucide-react";

const LandMonitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState("http://192.168.1.101:8000/predict");
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Tambahkan timestamp untuk menghindari cache
      const timestamp = new Date().getTime();
      const response = await fetch(`${apiUrl}?t=${timestamp}`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache", // Disable cache
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      setLastUpdate(new Date());
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError(
          "Tidak dapat terhubung ke server. Pastikan:\n1. API server berjalan\n2. CORS diaktifkan di server\n3. URL sudah benar"
        );
      } else {
        setError(err.message);
      }
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto refresh setiap 5 detik untuk data real-time
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [apiUrl]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "matang":
        return "bg-green-500";
      case "mendekati":
        return "bg-yellow-500";
      case "belum":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStressColor = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return "bg-green-500";
      case "ringan":
        return "bg-yellow-500";
      case "sedang":
        return "bg-orange-500";
      case "berat":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRecommendationColor = (rekomendasi) => {
    switch (rekomendasi?.toUpperCase()) {
      case "PANEN SEKARANG":
        return "bg-green-600";
      case "TUNDA":
        return "bg-orange-600";
      case "BELUM SIAP":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="flex-1 space-y-8 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black-800 mb-2">
            Land Monitoring System
          </h1>
          <p className="text-black-600">
            Real-time monitoring sistem pertanian pintar
          </p>
        </div>

        {/* API Configuration */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Konfigurasi API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="apiUrl" className="mb-2 block">
                  API URL
                </Label>
                <Input
                  id="apiUrl"
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://192.168.1.101:8000/predict"
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchData}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
            {lastUpdate && (
              <p className="text-sm text-gray-500 mt-3">
                Last update: {lastUpdate.toLocaleTimeString("id-ID")} |
                Auto-refresh: 5 detik
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-300 bg-red-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-red-700">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold mb-2">Error mengambil data</p>
                  <pre className="text-sm whitespace-pre-wrap bg-red-100 p-3 rounded">
                    {error}
                  </pre>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-gray-700 font-semibold mb-2">
                      💡 Solusi untuk "Failed to fetch":
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Pastikan API server berjalan di {apiUrl}</li>
                      <li>Endpoint GET harus tersedia</li>
                      <li>CORS sudah diaktifkan di FastAPI</li>
                      <li>
                        Test di browser:{" "}
                        <a
                          href={apiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {apiUrl}
                        </a>
                      </li>
                      <li>
                        Cek API docs:{" "}
                        <a
                          href="http://192.168.1.101:8000/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          FastAPI Swagger
                        </a>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !data && (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 text-gray-600 py-12">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <p>Memuat data...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Display */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Prediksi Berat */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Weight className="w-5 h-5 text-blue-600" />
                  Prediksi Berat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {data.prediksi_berat_gram}
                  <span className="text-xl text-gray-600 ml-1">gram</span>
                </div>
                <p className="text-sm text-gray-500">Estimasi berat panen</p>
              </CardContent>
            </Card>

            {/* Status Kematangan */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Status Kematangan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={`${getStatusColor(
                    data.status_kematangan
                  )} text-white text-lg px-4 py-2 mb-2`}
                >
                  {data.status_kematangan?.toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-500">
                  Tingkat kematangan tanaman
                </p>
              </CardContent>
            </Card>

            {/* Sisa Hari Panen */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Sisa Hari Panen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {data.sisa_hari_panen}
                  <span className="text-xl text-gray-600 ml-1">hari</span>
                </div>
                <p className="text-sm text-gray-500">
                  Estimasi waktu hingga panen
                </p>
              </CardContent>
            </Card>

            {/* Status Stres Tanaman */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Status Stres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={`${getStressColor(
                    data.status_stres_tanaman
                  )} text-white text-lg px-4 py-2 mb-2`}
                >
                  {data.status_stres_tanaman?.toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-500">
                  Kondisi kesehatan tanaman
                </p>
              </CardContent>
            </Card>

            {/* Rekomendasi Panen */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Rekomendasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={`${getRecommendationColor(
                    data.rekomendasi_panen
                  )} text-white text-lg px-4 py-2 mb-2`}
                >
                  {data.rekomendasi_panen}
                </Badge>
                <p className="text-sm text-gray-500">Saran tindakan panen</p>
              </CardContent>
            </Card>

            {/* Jam Panen Optimal */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sun className="w-5 h-5 text-yellow-600" />
                  Jam Optimal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {data.jam_panen_optimal}
                </div>
                <p className="text-sm text-gray-500">Waktu panen terbaik</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Footer */}
        <Card className="mt-6 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <p>
                Pastikan API server berjalan di{" "}
                <code className="bg-gray-200 px-2 py-1 rounded">{apiUrl}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandMonitoring;
