import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { examsApi } from "../../api/questions.api";
import { CheckCircle2, XCircle, MinusCircle, X, Trophy, CircleCheck, CircleX, CircleMinus } from "lucide-react";
import { useData } from "../../context/DataContext";

const statusMeta = {
  correct: { label: "Correct", Icon: CheckCircle2, card: "border-l-green-500 bg-green-50/30", badge: "bg-green-100 text-green-700" },
  wrong: { label: "Wrong", Icon: XCircle, card: "border-l-red-500 bg-red-50/30", badge: "bg-red-100 text-red-700" },
  missed: { label: "Missed", Icon: MinusCircle, card: "border-l-slate-400 bg-slate-50/60", badge: "bg-slate-200 text-slate-600" },
};

export default function Results() {
  const { results } = useData();
  const [selectedResult, setSelectedResult] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openResult = async (result) => {
    setSelectedResult(result);
    setDetail(null);
    setError("");
    setLoading(true);
    try {
      const response = await examsApi.resultDetail(result.id);
      setDetail(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Could not load the result details.");
    } finally {
      setLoading(false);
    }
  };

  const closeResult = () => {
    setSelectedResult(null);
    setDetail(null);
    setError("");
  };

  const counts = detail
    ? detail.questions.reduce((acc, question) => {
        acc[question.status] += 1;
        return acc;
      }, { correct: 0, wrong: 0, missed: 0 })
    : { correct: 0, wrong: 0, missed: 0 };

  return (
    <>
      <PageHeader
        eyebrow={results.length + " completed"}
        title="My Results"
        description="Track your results from completed exams."
      />

      <div className="!grid !grid-cols-1 !gap-4 sm:!grid-cols-2">
        {results.length ? results.map((result) => (
          <button
            key={result.id}
            type="button"
            onClick={() => openResult(result)}
            className="!m-0 !w-full !cursor-pointer !rounded-2xl !border !border-slate-200 !bg-white !p-5 !text-left !shadow-sm !transition-all !duration-200 hover:!-translate-y-1 hover:!border-green-200 hover:!shadow-lg focus:!outline-none focus:!ring-2 focus:!ring-green-500/20"
          >
            <div className="!mb-5 !flex !w-full !items-center !justify-between">
              <span className="!inline-flex !rounded-full !bg-green-50 !px-3 !py-1 !text-[10px] !font-extrabold !uppercase !tracking-wider !text-green-700">Completed</span>
              <span className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg !bg-slate-50 !text-slate-500">↗</span>
            </div>
            <h3 className="!m-0 !text-base !font-bold !leading-6 !text-slate-900">{result.name}</h3>
            <div className="!mt-4 !flex !items-baseline !gap-2">
              <strong className="!text-3xl !font-extrabold !leading-none !text-slate-900">{result.score}/{result.total}</strong>
              <span className="!text-sm !font-bold !text-green-600">{result.percent}%</span>
            </div>
            <div className="!mt-5 !border-t !border-slate-100 !pt-4 !text-xs !font-bold !text-green-600">View answer review <span>→</span></div>
          </button>
        )) : (
          <article className="!rounded-2xl !border !border-slate-200 !bg-white !p-6">
            <span className="!inline-flex !rounded-full !bg-slate-100 !px-3 !py-1 !text-[10px] !font-bold !text-slate-600">No attempts yet</span>
            <h3 className="!mt-4 !text-sm !font-semibold !text-slate-900">Complete an exam to see your result here.</h3>
          </article>
        )}
      </div>

      {selectedResult && (
        <div className="modal-backdrop !fixed !inset-0 !z-[100] !flex !items-center !justify-center !bg-slate-950/60 !p-3 sm:!p-6" onClick={closeResult}>
          <section className="modal !flex !h-[92vh] !max-h-[920px] !w-full !max-w-5xl !flex-col !overflow-hidden !rounded-2xl !bg-white !shadow-2xl sm:!rounded-3xl" onClick={(event) => event.stopPropagation()}>
            <header className="!flex !shrink-0 !items-start !justify-between !gap-4 !border-b !border-slate-100 !px-5 !py-5 sm:!px-7 sm:!py-6">
              <div className="!flex !min-w-0 !items-start !gap-3">
                <div className="!flex !h-11 !w-11 !shrink-0 !items-center !justify-center !rounded-xl !bg-green-50 !text-green-600"><Trophy size={20} /></div>
                <div className="!min-w-0">
                  <div className="!mb-1 !text-[10px] !font-extrabold !uppercase !tracking-[0.14em] !text-green-600">Answer Review</div>
                  <h2 className="!m-0 !truncate !text-lg !font-extrabold !text-slate-900 sm:!text-xl">{detail?.name || selectedResult.name}</h2>
                  <p className="!mt-1 !text-xs !text-slate-500">{detail ? "Review every answer from this attempt." : "Loading your submitted answers..."}</p>
                </div>
              </div>
              <button type="button" onClick={closeResult} aria-label="Close result review" className="!flex !h-9 !w-9 !shrink-0 !items-center !justify-center !rounded-xl !border-0 !bg-slate-100 !text-slate-500 hover:!bg-slate-200 hover:!text-slate-900"><X size={18} /></button>
            </header>

            {loading ? (
              <div className="!flex !min-h-0 !flex-1 !flex-col !items-center !justify-center !gap-2 !p-10 !text-center">
                <div className="!mb-2 !h-8 !w-8 !animate-spin !rounded-full !border-[3px] !border-slate-200 !border-t-green-500" />
                <strong className="!text-sm !font-bold !text-slate-800">Loading answer review</strong>
                <span className="!text-xs !text-slate-500">Fetching your submitted answers...</span>
              </div>
            ) : error ? (
              <div className="!flex !min-h-0 !flex-1 !flex-col !items-center !justify-center !gap-2 !p-10 !text-center">
                <XCircle size={25} className="!text-red-500" />
                <strong className="!text-sm !font-bold !text-slate-800">Unable to load this result</strong>
                <span className="!max-w-md !text-xs !leading-5 !text-slate-500">{error}</span>
              </div>
            ) : detail ? (
              <>
                <div className="!grid !shrink-0 !grid-cols-2 !gap-2 !border-b !border-slate-100 !bg-slate-50/70 !px-5 !py-4 sm:!grid-cols-4 sm:!gap-3 sm:!px-7">
                  <div className="!col-span-2 !rounded-xl !border !border-slate-200 !bg-white !p-3 sm:!col-span-1">
                    <span className="!block !text-[9px] !font-extrabold !uppercase !tracking-wider !text-slate-500">Score</span>
                    <strong className="!mt-1 !block !text-2xl !font-extrabold !leading-none !text-slate-900">{detail.score}<small className="!text-sm !font-bold !text-slate-400">/{detail.total}</small></strong>
                    <em className="!mt-1 !block !text-[10px] !not-italic !font-bold !text-green-600">{detail.percent}% overall</em>
                  </div>
                  <div className="!flex !min-h-[72px] !items-center !gap-2 !rounded-xl !border !border-green-100 !bg-green-50 !px-3"><CircleCheck size={18} className="!shrink-0 !text-green-600" /><div><strong className="!block !text-xl !font-extrabold !leading-none !text-slate-900">{counts.correct}</strong><span className="!mt-1 !block !text-[10px] !text-slate-500">Correct</span></div></div>
                  <div className="!flex !min-h-[72px] !items-center !gap-2 !rounded-xl !border !border-red-100 !bg-red-50 !px-3"><CircleX size={18} className="!shrink-0 !text-red-600" /><div><strong className="!block !text-xl !font-extrabold !leading-none !text-slate-900">{counts.wrong}</strong><span className="!mt-1 !block !text-[10px] !text-slate-500">Wrong</span></div></div>
                  <div className="!flex !min-h-[72px] !items-center !gap-2 !rounded-xl !border !border-slate-200 !bg-white !px-3"><CircleMinus size={18} className="!shrink-0 !text-slate-500" /><div><strong className="!block !text-xl !font-extrabold !leading-none !text-slate-900">{counts.missed}</strong><span className="!mt-1 !block !text-[10px] !text-slate-500">Missed</span></div></div>
                </div>

                <div className="!flex !shrink-0 !items-center !justify-between !gap-3 !px-5 !py-4 sm:!px-7">
                  <div className="!flex !items-baseline !gap-2"><strong className="!text-sm !font-bold !text-slate-900">Question review</strong><span className="!text-[10px] !text-slate-400">{detail.questions.length} questions</span></div>
                  <div className="!hidden !items-center !gap-3 sm:!flex">
                    <span className="!flex !items-center !gap-1.5 !text-[10px] !font-semibold !text-slate-500"><i className="!h-2 !w-2 !rounded-full !bg-green-500" />Correct</span>
                    <span className="!flex !items-center !gap-1.5 !text-[10px] !font-semibold !text-slate-500"><i className="!h-2 !w-2 !rounded-full !bg-red-500" />Wrong</span>
                    <span className="!flex !items-center !gap-1.5 !text-[10px] !font-semibold !text-slate-500"><i className="!h-2 !w-2 !rounded-full !bg-slate-400" />Missed</span>
                  </div>
                </div>

                <div className="!min-h-0 !flex-1 !overflow-y-auto !px-5 !pb-5 sm:!px-7">
                  <div className="!space-y-3">
                    {detail.questions.map((question) => {
                      const meta = statusMeta[question.status] || statusMeta.missed;
                      const Icon = meta.Icon;
                      return (
                        <article key={question.questionId} className={"!rounded-xl !border !border-slate-200 !border-l-4 !p-4 sm:!p-5 " + meta.card}>
                          <div className="!flex !flex-col !items-start !justify-between !gap-3 sm:!flex-row">
                            <div className="!flex !min-w-0 !items-start !gap-3">
                              <span className="!flex !h-7 !min-w-8 !shrink-0 !items-center !justify-center !rounded-lg !bg-slate-100 !px-2 !text-[10px] !font-extrabold !text-slate-600">Q{question.number}</span>
                              <strong className="!min-w-0 !text-sm !font-semibold !leading-6 !text-slate-800">{question.text}</strong>
                            </div>
                            <span className={"!inline-flex !shrink-0 !items-center !gap-1.5 !rounded-lg !px-2.5 !py-1.5 !text-[10px] !font-bold " + meta.badge}><Icon size={14} />{meta.label}</span>
                          </div>

                          <div className="!mt-4 !grid !grid-cols-1 !gap-2 sm:!grid-cols-2">
                            <div className={question.selectedAnswer == null ? "!rounded-xl !border !border-amber-200 !bg-amber-50/60 !px-3.5 !py-3" : "!rounded-xl !border !border-slate-200 !bg-slate-50 !px-3.5 !py-3"}>
                              <span className="!mb-1 !block !text-[9px] !font-extrabold !uppercase !tracking-wider !text-slate-400">Your answer</span>
                              <strong className={question.selectedAnswer == null ? "!block !text-xs !italic !text-slate-400" : "!block !text-xs !font-semibold !leading-5 !text-slate-700"}>
                                {question.selectedAnswer == null ? "Not answered" : String.fromCharCode(65 + question.selectedAnswer) + ". " + question.options[question.selectedAnswer]}
                              </strong>
                            </div>

                            <div className="!rounded-xl !border !border-green-200 !bg-green-50 !px-3.5 !py-3">
                              <span className="!mb-1 !block !text-[9px] !font-extrabold !uppercase !tracking-wider !text-green-600">Correct answer</span>
                              <strong className="!block !text-xs !font-semibold !leading-5 !text-green-800">{String.fromCharCode(65 + question.correctAnswer) + ". " + question.options[question.correctAnswer]}</strong>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}

            <div className="!flex !shrink-0 !justify-end !border-t !border-slate-100 !bg-white !px-5 !py-3 sm:!px-7">
              <Button variant="secondary" onClick={closeResult}>Close review</Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
