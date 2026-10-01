'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  Check, 
  Loader2 
} from 'lucide-react';
import { useWorkoutStore } from '@/hooks/useWorkoutStore';
import { Exercise, MuscleGroup, EquipmentType } from '@/lib/types';
import { uploadImageToImgBB } from '@/lib/imgbb/client';

export default function ExercisesPage() {
  const { exercises, addCustomExercise } = useWorkoutStore();
  const [search, setSearch] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Chest');
  const [newExEquipment, setNewExEquipment] = useState<EquipmentType>('Barbell');
  const [newExInstructions, setNewExInstructions] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newExImageUrl, setNewExImageUrl] = useState('');

  const muscles: string[] = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Biceps', 'Triceps', 'Abs', 'Calves'];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.primaryMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const result = await uploadImageToImgBB(file);
    if (result.success && result.url) {
      setNewExImageUrl(result.url);
    } else {
      alert('Failed to upload image: ' + (result.error || 'Unknown error'));
    }
    setUploadingImage(false);
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name: newExName.trim(),
      primaryMuscle: newExMuscle,
      secondaryMuscles: [],
      equipment: newExEquipment,
      movementPattern: 'Isolation',
      supportedProgression: 'double_progression',
      defaultRestSeconds: 90,
      instructions: newExInstructions.trim(),
      imageUrl: newExImageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await addCustomExercise(newEx);
    setShowAddModal(false);
    setNewExName('');
    setNewExInstructions('');
    setNewExImageUrl('');
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
            {exercises.length} compound and isolation movements with form guides
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Custom Exercise
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

      {/* Exercise List WITH ACTUAL PHOTOGRAPHS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredExercises.map((exercise) => {
          const photo = exercise.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80';

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
                  {exercise.isCustom && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      Custom
                    </span>
                  )}
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

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-2xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Exercise Modal with ImgBB integration */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateExercise}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Create Custom Exercise
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Exercise Name *</label>
                <input
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Bulgarian Split Squat"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Primary Muscle</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-zinc-900 dark:text-zinc-100"
                  >
                    {muscles.filter(m => m !== 'All').map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Equipment</label>
                  <select
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value as EquipmentType)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-zinc-900 dark:text-zinc-100"
                  >
                    {['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell'].map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Form Instructions</label>
                <textarea
                  rows={2}
                  value={newExInstructions}
                  onChange={(e) => setNewExInstructions(e.target.value)}
                  placeholder="Form tips, cueing, setup..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>

              {/* ImgBB Image Upload */}
              <div>
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block mb-1">Photo (via ImgBB Free Hosting)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-900 dark:file:text-zinc-100 hover:file:bg-zinc-200"
                  />
                  {uploadingImage && <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />}
                </div>
                {newExImageUrl && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">Image uploaded successfully!</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Save Exercise
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
