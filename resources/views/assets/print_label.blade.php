<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Label Aset - {{ $asset->code }}</title>
    <style>
        @media print {
            @page {
                size: 8cm 5cm; /* Ukuran Stiker */
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
        body {
            font-family: Arial, sans-serif;
            width: 8cm;
            height: 5cm;
            border: 1px dashed #ccc; /* Garis bantu potong (hilang saat print setting margin 0) */
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: white;
        }
        .label-container {
            width: 95%;
            height: 90%;
            border: 2px solid #000;
            border-radius: 8px;
            padding: 5px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
        }
        .qr-area {
            width: 110px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 2px solid #000;
            padding-right: 5px;
        }
        .info-area {
            flex: 1;
            padding-left: 10px;
        }
        .company-name {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            color: #555;
            margin-bottom: 2px;
        }
        .asset-code {
            font-size: 16px;
            font-weight: 900;
            display: block;
            margin-bottom: 2px;
        }
        .asset-name {
            font-size: 10px;
            line-height: 1.1;
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            max-height: 22px;
            overflow: hidden;
        }
        .asset-meta {
            font-size: 8px;
            color: #333;
        }
    </style>
</head>
<body onload="window.print()">
    <div class="label-container">
        <div class="qr-area">
            {!! $qrCode !!}
        </div>

        <div class="info-area">
            <div class="company-name">MajiAssets Property</div>
            <span class="asset-code">{{ $asset->code }}</span>
            <span class="asset-name">{{ Str::limit($asset->name, 40) }}</span>

            <div class="asset-meta">
                Tgl Beli: {{ $asset->purchase_date ? $asset->purchase_date->format('d/m/Y') : '-' }}<br>
                Lokasi: {{ Str::limit($asset->location, 15) }}
            </div>
        </div>
    </div>
</body>
</html>
