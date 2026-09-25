import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus } from 'lucide-react';
import type { ThemeClasses } from '../types';

interface DepartmentsTabProps {
  departmentsTree: any[];
  setShowAddDeptModal: (show: boolean) => void;
  setShowAddCourseModal: (show: boolean) => void;
  setFormMsg: (msg: { text: string; isError: boolean }) => void;
  theme: ThemeClasses;
}

const DepartmentsTab: React.FC<DepartmentsTabProps> = ({
  departmentsTree,
  setShowAddDeptModal,
  setShowAddCourseModal,
  setFormMsg,
  theme
}) => {
  const { textPrimary, textSecondary, cardInner, card, divider } = theme;

  return (
    <motion.div key="depts" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Academic Departments & Structure</h1>
          <p className={`${textSecondary} text-xs mt-1`}>Hierarchical catalog of departments, academic years, sections, and courses</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => { setFormMsg({ text: '', isError: false }); setShowAddDeptModal(true); }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" /> <span>Add Department</span>
          </button>
          <button
            onClick={() => { setFormMsg({ text: '', isError: false }); setShowAddCourseModal(true); }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" /> <span>Add Course</span>
          </button>
        </div>
      </div>

      {departmentsTree.length === 0 ? (
        <div className={`${card} border rounded-2xl p-12 text-center`}>
          <Building2 className={`w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500`} />
          <p className={`font-semibold ${textPrimary}`}>No departments recorded yet.</p>
          <p className={`text-xs ${textSecondary} mt-1`}>Click "Add Department" above to configure your campus structure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departmentsTree.map(dept => (
            <div key={dept.id} className={`${card} border rounded-2xl p-6 transition-all duration-200`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs rounded-lg">
                    {dept.code}
                  </span>
                  <h3 className={`text-lg font-bold mt-2 ${textPrimary}`}>{dept.name}</h3>
                </div>
                <div className={`text-right text-xs ${textSecondary}`}>
                  <span className={`block font-semibold ${textPrimary}`}>{dept._count?.students || 0} Students</span>
                  <span>{dept._count?.faculties || 0} Faculty • {dept._count?.courses || 0} Courses</span>
                </div>
              </div>

              <div className={`space-y-3 pt-3 border-t ${divider}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Classes & Sections</p>
                  <span className="text-xs text-amber-500 font-medium">{dept.classes?.length || 0} Batches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dept.classes && dept.classes.length > 0 ? (
                    dept.classes.map((c: any) => (
                      <div key={c.id} className={`${cardInner} px-3 py-1.5 rounded-xl text-xs border`}>
                        <span className={`font-semibold ${textPrimary}`}>{c.name}</span>
                        <span className={`${textSecondary} ml-2`}>
                          ({c.sections?.map((s: any) => s.name).join(', ') || 'No sections'})
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className={`text-xs ${textSecondary} italic`}>No classes assigned to this branch yet.</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Registered Courses</p>
                  <span className="text-xs text-purple-500 font-medium">{dept.courses?.length || 0} Courses</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dept.courses && dept.courses.length > 0 ? (
                    dept.courses.map((crs: any) => (
                      <span key={crs.id} className={`px-2.5 py-1 rounded-lg ${cardInner} text-cyan-500 text-xs border font-mono`}>
                        {crs.code} — {crs.name}
                      </span>
                    ))
                  ) : (
                    <span className={`text-xs ${textSecondary} italic`}>No active courses linked.</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DepartmentsTab;
