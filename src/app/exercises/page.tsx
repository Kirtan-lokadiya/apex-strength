'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  Check, 
  Loader2,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { Exercise, MuscleGroup, EquipmentType } from '@/lib/types';
import { uploadImageToImgBB } from '@/lib/imgbb/client';

const CURATED_PRESETS: { label: string; muscle: MuscleGroup; url: string }[] = [
  { label: 'Barbell Bench Press', muscle: 'Chest', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Dumbbell Incline Press', muscle: 'Chest', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Deadlift / Pull', muscle: 'Back', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Barbell Row / Lat Pull', muscle: 'Back', url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=80' },
  { label: 'Barbell Back Squat', muscle: 'Quads', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80' },
  { label: 'Leg Press / Lunge', muscle: 'Quads', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80' },
  { label: 'Overhead Shoulder Press', muscle: 'Shoulders', url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Dumbbell Lateral Raise', muscle: 'Shoulders', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80' },
  { label: 'Biceps Cable / DB Curl', muscle: 'Biceps', url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tricep Pushdown / Dip', muscle: 'Triceps', url: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=800&auto=format&fit=crop&q=80' },
  { label: 'Abs Core / Plank', muscle: 'Abs', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Calf Raise / Jump', muscle: 'Calves', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80' },
];

export default function ExercisesPage() {
  const { exercises, addCustomExercise, updateExercise, deleteCustomExercise } = useWorkoutStore();
  const [search, setSearch] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Form modal state (for both creating and editing)
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [editingTarget, setEditingTarget] = useState<Exercise | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formMuscle, setFormMuscle] = useState<MuscleGroup>('Chest');
  const [formEquipment, setFormEquipment] = useState<EquipmentType>('Barbell');
  const [formInstructions, setFormInstructions] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const muscles: string[] = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Biceps', 'Triceps', 'Abs', 'Calves'];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.primaryMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const openCreateModal = () => {
    setEditingTarget(null);
    setFormName('');
    setFormMuscle('Chest');
    setFormEquipment('Barbell');
    setFormInstructions('');
    setFormImageUrl(CURATED_PRESETS[0].url);
    setFormModalOpen(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingTarget(exercise);
    setFormName(exercise.name);
    setFormMuscle(exercise.primaryMuscle);
    setFormEquipment(exercise.equipment);
    setFormInstructions(exercise.instructions || '');
    setFormImageUrl(exercise.imageUrl || CURATED_PRESETS[0].url);
    setFormModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const result = await uploadImageToImgBB(file);
    if (result.success && result.url) {
      setFormImageUrl(result.url);
    } else {
      alert('Failed to upload image: ' + (result.error || 'Unknown error'));
    }
    setUploadingImage(false);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingTarget) {
      // Update existing movement
      const updated: Exercise = {
        ...editingTarget,
        name: formName.trim(),
        primaryMuscle: formMuscle,
        equipment: formEquipment,
        instructions: formInstructions.trim(),
        imageUrl: formImageUrl.trim() || editingTarget.imageUrl,
        updatedAt: Date.now(),
      };
      await updateExercise(updated);
      if (selectedExercise?.id === updated.id) {
        setSelectedExercise(updated);
      }
    } else {
      // Create brand new custom movement
      const newEx: Exercise = {
        id: `custom-${Date.now()}`,
        name: formName.trim(),
        primaryMuscle: formMuscle,
        secondaryMuscles: [],
        equipment: formEquipment,
        movementPattern: 'Isolation',
        supportedProgression: 'double_progression',
        defaultRestSeconds: 90,
        instructions: formInstructions.trim(),
        imageUrl: formImageUrl.trim() || CURATED_PRESETS[0].url,
        isCustom: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await addCustomExercise(newEx);
    }

    setFormModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Exercise Library
          </h2>
          <p className="text-xs text-zinc-500">
            {exercises.length} compound and isolation movements • Create, edit & customize photos
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Exercise
        </button>
      </div>

      {/* Search & Muscle Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises by name..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 placeholder:text-zinc-400 transition-colors shadow-xs"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {muscles.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                selectedMuscle === m
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List WITH ACTUAL PHOTOGRAPHS & EDIT BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredExercises.map((exercise) => {
          const photo = exercise.imageUrl || CURATED_PRESETS[0].url;

          return (
            <div
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-3.5 cursor-pointer transition-all hover:scale-[1.01] flex items-center gap-3.5 shadow-xs"
            >
              {/* Actual Exercise Photo Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                    {exercise.name}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    {exercise.isCustom && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        Custom
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(exercise);
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Edit Exercise / Photo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {exercise.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete custom exercise "${exercise.name}"?`)) {
                            deleteCustomExercise(exercise.id);
                          }
                        }}
                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete custom exercise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{exercise.primaryMuscle}</span>
                  <span>•</span>
                  <span>{exercise.equipment}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg">
                {selectedExercise.name}
              </h3>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedExercise.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedExercise.imageUrl}
                alt={selectedExercise.name}
                className="w-full h-48 object-cover rounded-2xl border border-zinc-200 dark:border-zinc-800"
              />
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 block">Primary Muscle</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{selectedExercise.primaryMuscle}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 block">Equipment</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{selectedExercise.equipment}</span>
              </div>
            </div>

            {selectedExercise.instructions && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Instructions</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  {selectedExercise.instructions}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(selectedExercise)}
                className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>

              {selectedExercise.isCustom && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete custom exercise "${selectedExercise.name}"?`)) {
                      deleteCustomExercise(selectedExercise.id);
                      setSelectedExercise(null);
                    }
                  }}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}

              <button
                onClick={() => setSelectedExercise(null)}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-2xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Exercise Create & Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveExercise}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                {editingTarget ? <Edit3 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" /> : <Plus className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />}
                <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">
                  {editingTarget ? `Edit ${editingTarget.name}` : 'Create New Exercise'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Exercise Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Incline Dumbbell Press"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>

              {/* Muscle & Equipment */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Primary Muscle</label>
                  <select
                    value={formMuscle}
                    onChange={(e) => setFormMuscle(e.target.value as MuscleGroup)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-zinc-900 dark:text-zinc-100 font-medium"
                  >
                    {muscles.filter(m => m !== 'All').map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Equipment</label>
                  <select
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value as EquipmentType)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-zinc-900 dark:text-zinc-100 font-medium"
                  >
                    {['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell'].map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Form Instructions & Cues</label>
                <textarea
                  rows={2}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Setup, stance, breathing cues, range of motion..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>

              {/* Photo Management Section */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="font-extrabold uppercase text-zinc-500 tracking-wider block text-[11px] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                  Exercise Photography
                </span>

                {/* Live Preview */}
                {formImageUrl && (
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formImageUrl}
                      alt="Exercise Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md font-mono">
                      Live Preview
                    </span>
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Image URL (Unsplash, CDN or Imgur)</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* 1-Tap Curated Fitness Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Or Select from Curated Fitness Photos:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CURATED_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormImageUrl(preset.url);
                          if (!editingTarget && formName === '') {
                            setFormName(preset.label);
                            setFormMuscle(preset.muscle);
                          }
                        }}
                        className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all ${
                          formImageUrl === preset.url
                            ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900 dark:ring-zinc-100'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <div className="h-14 w-full rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 truncate block mt-1">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload via ImgBB */}
                <div className="pt-2">
                  <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Or Upload Custom Photo from Device</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-900 dark:file:text-zinc-100 hover:file:bg-zinc-200 cursor-pointer"
                    />
                    {uploadingImage && <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {editingTarget ? 'Save Changes' : 'Create Exercise'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
