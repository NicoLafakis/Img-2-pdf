import { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import {
  Upload,
  RotateCw,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileDown,
  Image as ImageIcon,
  X
} from 'lucide-react'

function ImageToPDF() {
  const [images, setImages] = useState([])
  const [filename, setFilename] = useState('my-document')
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef(null)

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) return

    const newImages = imageFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      rotation: 0,
      name: file.name
    }))

    setImages(prev => [...prev, ...newImages])

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Rotate image 90 degrees clockwise
  const rotateImage = (id) => {
    setImages(prev => prev.map(img =>
      img.id === id
        ? { ...img, rotation: (img.rotation + 90) % 360 }
        : img
    ))
  }

  // Move image up in order
  const moveUp = (index) => {
    if (index === 0) return
    setImages(prev => {
      const newImages = [...prev]
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
      return newImages
    })
  }

  // Move image down in order
  const moveDown = (index) => {
    if (index === images.length - 1) return
    setImages(prev => {
      const newImages = [...prev]
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      return newImages
    })
  }

  // Remove image
  const removeImage = (id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.url)
      return prev.filter(i => i.id !== id)
    })
  }

  // Clear all images
  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.url))
    setImages([])
  }

  // Load image and apply rotation
  const loadImageWithRotation = (imageData) => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const rotation = imageData.rotation
        const isRotated = rotation === 90 || rotation === 270

        // Set canvas size based on rotation
        if (isRotated) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }

        // Apply rotation
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          width: canvas.width,
          height: canvas.height
        })
      }
      img.src = imageData.url
    })
  }

  // Generate PDF
  const generatePDF = async () => {
    if (images.length === 0) return

    setIsGenerating(true)

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const margin = 10
      const maxWidth = pageWidth - (margin * 2)
      const maxHeight = pageHeight - (margin * 2)

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage()

        const imageData = await loadImageWithRotation(images[i])

        // Calculate dimensions to fit on page
        const imgRatio = imageData.width / imageData.height
        const pageRatio = maxWidth / maxHeight

        let finalWidth, finalHeight

        if (imgRatio > pageRatio) {
          // Image is wider than page ratio
          finalWidth = maxWidth
          finalHeight = maxWidth / imgRatio
        } else {
          // Image is taller than page ratio
          finalHeight = maxHeight
          finalWidth = maxHeight * imgRatio
        }

        // Center image on page
        const x = (pageWidth - finalWidth) / 2
        const y = (pageHeight - finalHeight) / 2

        pdf.addImage(imageData.dataUrl, 'JPEG', x, y, finalWidth, finalHeight)
      }

      // Sanitize filename
      const sanitizedFilename = filename.trim().replace(/[^a-zA-Z0-9-_]/g, '_') || 'document'
      pdf.save(`${sanitizedFilename}.pdf`)

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon size={24} />
            Image to PDF
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Convert your images to PDF — everything stays on your device
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-32">
        {/* Upload Section */}
        <div className="mb-6">
          <label
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl bg-white cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <Upload className="text-blue-500 mb-2" size={32} />
            <span className="text-blue-600 font-medium">Tap to select images</span>
            <span className="text-gray-400 text-sm mt-1">JPG, PNG, GIF, WebP</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Image Count & Clear */}
        {images.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">
              {images.length} image{images.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={clearAll}
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              <X size={16} />
              Clear all
            </button>
          </div>
        )}

        {/* Image List */}
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center p-3 gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    style={{ transform: `rotate(${image.rotation}deg)` }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Page {index + 1} of {images.length}
                    {image.rotation !== 0 && ` • Rotated ${image.rotation}°`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ArrowUp size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === images.length - 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ArrowDown size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => rotateImage(image.id)}
                    className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-400">No images selected yet</p>
            <p className="text-gray-300 text-sm mt-1">
              Tap the button above to add images
            </p>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      {images.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Filename Input */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">PDF Filename</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="my-document"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-400 text-sm">.pdf</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown size={20} />
                  Create PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageToPDF
