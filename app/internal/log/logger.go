package log

import (
	"io"
	"os"

	"github.com/rs/zerolog"
	"gopkg.in/natefinch/lumberjack.v2"
)

type levelWriter struct {
	writer   io.Writer
	minLevel zerolog.Level
	maxLevel zerolog.Level
}

func (lw levelWriter) Write(p []byte) (n int, err error) {
	return lw.writer.Write(p)
}

func (lw levelWriter) WriteLevel(level zerolog.Level, p []byte) (n int, err error) {
	if level >= lw.minLevel && level <= lw.maxLevel {
		return lw.writer.Write(p)
	}
	return len(p), nil
}

func NewLogger(logFilePath, errorLogFilePath, debugLogFilePath string, maxSizeMB, maxBackups, maxAgeDays int, compress bool) *zerolog.LevelWriter {
	infoLogWriter := &lumberjack.Logger{
		Filename:   logFilePath,
		MaxSize:    maxSizeMB,
		MaxBackups: maxBackups,
		MaxAge:     maxAgeDays,
		Compress:   compress,
	}

	errorLogWriter := &lumberjack.Logger{
		Filename:   errorLogFilePath,
		MaxSize:    maxSizeMB,
		MaxBackups: maxBackups,
		MaxAge:     maxAgeDays,
		Compress:   compress,
	}

	debugLogWriter := &lumberjack.Logger{
		Filename:   debugLogFilePath,
		MaxSize:    maxSizeMB,
		MaxBackups: maxBackups,
		MaxAge:     maxAgeDays,
		Compress:   compress,
	}

	logWriter := zerolog.MultiLevelWriter(
		levelWriter{writer: os.Stdout, minLevel: zerolog.InfoLevel, maxLevel: zerolog.FatalLevel},
		levelWriter{writer: infoLogWriter, minLevel: zerolog.InfoLevel, maxLevel: zerolog.InfoLevel},
		levelWriter{writer: errorLogWriter, minLevel: zerolog.ErrorLevel, maxLevel: zerolog.FatalLevel},
		levelWriter{writer: debugLogWriter, minLevel: zerolog.DebugLevel, maxLevel: zerolog.DebugLevel},
	)

	return &logWriter
}
